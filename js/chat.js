// =============================================================
// chat.js  —  404x1  |  Enhanced with Telegram-level features
// New: Edit · Delete · Forward · Pin · Typing · Search ·
//      Context Menu · Reply Quotes · Message Grouping
// Architecture: Base44 serverless (fast-poll, no WebSocket)
// All original logic preserved; only safe additions made.
// =============================================================

// ── 1. ENDPOINTS ──────────────────────────────────────────────
// auth.js defines window.API_ENDPOINTS first but may omit
// new endpoints.  We fill ONLY missing keys, never overwrite.
window.API_ENDPOINTS = window.API_ENDPOINTS || {};
(function () {
    var B = 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/';
    var needed = {
        chatSend:    B + 'chatSend',
        chatHistory: B + 'chatHistory',
        chatReact:   B + 'chatReact',
        chatEdit:    B + 'chatEdit',
        chatDelete:  B + 'chatDelete',
        chatTyping:  B + 'chatTyping',
        chatPin:     B + 'chatPin',
        chatSearch:  B + 'chatSearch',
        gameStats:   B + 'gameStats'
    };
    Object.keys(needed).forEach(function (k) {
        if (!window.API_ENDPOINTS[k]) window.API_ENDPOINTS[k] = needed[k];
    });
}());

// ── 2. CONSTANTS ───────────────────────────────────────────────
var QUICK_EMOJIS       = ['👍', '❤️', '😂', '🎉', '🔥', '👏'];
var POLL_MS            = 1500;   // near-real-time feel
var TYPING_RESET_MS    = 3000;
var SEARCH_DEBOUNCE_MS = 300;

var ALL_EMOJIS = [
    '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃',
    '😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙',
    '😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔',
    '🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥',
    '😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮',
    '🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓',
    '😈','👿','👹','👺','💀','☠️','👻','👽','👾','🤖',
    '👍','👎','👏','🙌','👐','🤝','🙏','✊','👊','🤛',
    '🤜','🤞','✌️','🤟','🤘','👌','🤏','👈','👉','👆',
    '👇','☝️','✋','🤚','🖐️','🖖','👋','🤙','💪','🦾',
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔',
    '❤️‍🔥','💕','💞','💓','💗','💖','💘','💝','💟','☮️',
    '✨','💯','🔥','⚡','💥','💫','⭐','🌟','✅','❌'
];

// ── 3. STATE ───────────────────────────────────────────────────
var replyingTo      = null;   // { messageId, username, messageText }
var attachedFile    = null;
var isTypingSent    = false;
var typingTimer     = null;
var longPressTimer  = null;
var searchDebounce  = null;

// ── 4. UTILITIES ───────────────────────────────────────────────
function getCurrentUser() {
    var s = localStorage.getItem('404x1_user');
    return s ? JSON.parse(s) : null;
}
function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str; return d.innerHTML;
}
function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
function isPrivileged() {
    var u = getCurrentUser();
    return u && ['admin','superuser','moderator'].includes(u.user_role);
}
function flashHighlight(el) {
    el.classList.add('ca-highlight');
    setTimeout(function () { el.classList.remove('ca-highlight'); }, 1600);
}

// ── 5. PROFILE ─────────────────────────────────────────────────
function updateProfileDisplay() {
    var user = getCurrentUser(); if (!user) return;
    var el = document.getElementById('username-mini');
    if (el) el.textContent = user.username;
    document.querySelectorAll('.rp-value').forEach(function (e) {
        e.textContent = user.reputation_points || 0;
    });
}
async function loadUserStats() {
    var user = getCurrentUser(); if (!user) return;
    try {
        var res  = await fetch(window.API_ENDPOINTS.gameStats + '?user_id=' + user.id);
        var data = await res.json();
        if (data.success && data.stats) {
            user.reputation_points = data.stats.reputation_points;
            localStorage.setItem('404x1_user', JSON.stringify(user));
            document.querySelectorAll('.rp-value').forEach(function (e) {
                e.textContent = data.stats.reputation_points || 0;
            });
        }
    } catch (e) {}
}

// ── 6. SCROLL ──────────────────────────────────────────────────
function isAtBottom() {
    var c = document.getElementById('messages-container');
    return c ? Math.abs(c.scrollHeight - c.scrollTop - c.clientHeight) < 80 : false;
}
function smartScroll()        { if (isAtBottom()) forceScrollToBottom(); }
function forceScrollToBottom() {
    var c = document.getElementById('messages-container');
    if (c) c.scrollTop = c.scrollHeight;
}
function initScrollBtn() {
    var c   = document.getElementById('messages-container');
    var btn = document.getElementById('ca-scroll-btn');
    if (!c || !btn) return;
    c.addEventListener('scroll', function () {
        btn.style.display =
            (c.scrollHeight - c.scrollTop - c.clientHeight) > 150 ? 'flex' : 'none';
    });
    btn.addEventListener('click', forceScrollToBottom);
}

// ── 7. TYPING ──────────────────────────────────────────────────
async function sendTypingPing() {
    var user = getCurrentUser(); if (!user || isTypingSent) return;
    isTypingSent = true;
    try {
        await fetch(window.API_ENDPOINTS.chatTyping, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, username: user.username })
        });
    } catch (e) {}
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () { isTypingSent = false; }, TYPING_RESET_MS);
}
function renderTyping(typingUsers) {
    var bar = document.getElementById('ca-typing');
    var txt = document.getElementById('ca-typing-text');
    if (!bar || !txt) return;
    var me = getCurrentUser(); var now = Date.now();
    var active = (typingUsers || []).filter(function (u) {
        if (me && u.username === me.username) return false;
        return new Date(u.typing_until).getTime() > now;
    });
    if (!active.length) { bar.style.display = 'none'; return; }
    txt.textContent = active.length === 1
        ? active[0].username + ' is typing'
        : active.length === 2
            ? active[0].username + ' and ' + active[1].username + ' are typing'
            : active.length + ' people are typing';
    bar.style.display = 'flex';
}

// ── 8. PINNED ──────────────────────────────────────────────────
function renderPinned(pinned) {
    var bar = document.getElementById('ca-pinned'); if (!bar) return;
    if (!pinned) { bar.style.display = 'none'; return; }
    var full = pinned.username + ': ' + pinned.message;
    document.getElementById('ca-pinned-text').textContent =
        full.length > 80 ? full.substring(0, 80) + '…' : full;
    bar.style.display = 'flex';
    var ub = document.getElementById('ca-unpin-btn');
    if (ub) ub.style.display = isPrivileged() ? 'flex' : 'none';
    bar.onclick = function (e) {
        if (e.target === ub) return;
        var t = document.querySelector('[data-message-id="' + pinned.id + '"]');
        if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); flashHighlight(t); }
    };
}
async function unpinMessage() {
    var user = getCurrentUser(); if (!user || !isPrivileged()) return;
    try {
        await fetch(window.API_ENDPOINTS.chatPin, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, message_id: null, action: 'unpin' })
        });
        document.getElementById('ca-pinned').style.display = 'none';
    } catch (e) {}
}

// ── 9. LOAD MESSAGES ───────────────────────────────────────────
async function loadMessages() {
    try {
        var res  = await fetch(window.API_ENDPOINTS.chatHistory + '?limit=100&offset=0');
        var data = await res.json();
        if (data.success) {
            displayMessages(data.messages || [], data.reactions || []);
            renderTyping(data.typing_users   || []);
            renderPinned(data.pinned_message  || null);
            smartScroll();
        }
    } catch (e) { console.error('Load error:', e); }
}

function displayMessages(messages, reactions) {
    var container = document.getElementById('messages-container');
    if (!container) return;

    // Smart diff — prevents flicker when nothing changed
    var mh = messages.map(function (m) {
        return m.id + '|' + (m.edited_at || '') + '|' + (m.is_deleted ? 'd' : '') + '|' + m.message;
    }).join('~');
    var rh = reactions.map(function (r) { return r.message_id + r.emoji + r.from_player_id; }).join('~');
    if (container._mh === mh && container._rh === rh) return;
    container._mh = mh; container._rh = rh;

    var wasBottom  = isAtBottom();
    var savedTop   = container.scrollTop;
    container.innerHTML = '';

    if (!messages.length) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#666;"><p>No messages yet. Be the first to chat! 💬</p></div>';
        return;
    }

    var me = getCurrentUser();

    // Build reaction lookup
    var rxMap = {};
    reactions.forEach(function (r) {
        if (!rxMap[r.message_id]) rxMap[r.message_id] = [];
        rxMap[r.message_id].push(r);
    });

    var sorted = messages.slice().sort(function (a, b) {
        return new Date(a.created_date) - new Date(b.created_date);
    });

    sorted.forEach(function (msg, idx) {
        var prev    = sorted[idx - 1];
        var isOwn   = me && msg.username === me.username;
        // Group: same user, no reply/fwd, within 2 min, neither deleted
        var grouped = prev
            && !msg.is_deleted && !prev.is_deleted
            && prev.username === msg.username
            && !msg.forwarded_from_username && !msg.reply_to_message_id
            && (new Date(msg.created_date) - new Date(prev.created_date)) < 120000;

        var msgRx  = rxMap[msg.id] || [];
        var counts = {}; var userHas = {};
        msgRx.forEach(function (r) {
            counts[r.emoji] = (counts[r.emoji] || 0) + 1;
            if (me && r.from_player_id === me.id) userHas[r.emoji] = true;
        });

        container.appendChild(buildMessage(msg, isOwn, grouped, counts, userHas));
    });

    if (wasBottom) container.scrollTop = container.scrollHeight;
    else           container.scrollTop = savedTop;
}

// ── 10. BUILD MESSAGE ──────────────────────────────────────────
function buildMessage(msg, isOwn, grouped, rxCounts, userHas) {
    var wrap = document.createElement('div');
    wrap.className = 'message' +
        (isOwn    ? ' own-message' : '') +
        (grouped  ? ' ca-grouped'  : '');
    wrap.setAttribute('data-message-id', msg.id);

    // ── Deleted placeholder ──
    if (msg.is_deleted) {
        var dp = document.createElement('div');
        dp.className = 'ca-deleted'; dp.textContent = '🗑 Message deleted';
        wrap.appendChild(dp); return wrap;
    }

    // ── Grouped timestamp (appears on hover via CSS) ──
    if (grouped) {
        var gt = document.createElement('span');
        gt.className = 'time ca-grouped-time'; gt.textContent = formatTime(msg.created_date);
        wrap.appendChild(gt);
    }

    // ── Header (username + time) ──
    if (!grouped) {
        var hdr = document.createElement('div'); hdr.className = 'message-header';
        var u   = document.createElement('span');
        u.className   = 'username' + (isOwn ? ' own-username' : '');
        u.textContent = msg.username;
        var t   = document.createElement('span');
        t.className   = 'time'; t.textContent = formatTime(msg.created_date);
        hdr.appendChild(u); hdr.appendChild(t); wrap.appendChild(hdr);
    }

    // ── Forwarded label ──
    if (msg.forwarded_from_username) {
        var fl = document.createElement('div');
        fl.className   = 'ca-fwd-label';
        fl.textContent = '⮂ Forwarded from ' + msg.forwarded_from_username;
        wrap.appendChild(fl);
    }

    // ── Reply quote ──
    if (msg.reply_to_message_id && msg.reply_to_username) {
        var q  = document.createElement('div'); q.className = 'ca-reply-quote';
        var qu = document.createElement('span'); qu.className = 'ca-reply-quote-user'; qu.textContent = msg.reply_to_username;
        var qt = document.createElement('span'); qt.className = 'ca-reply-quote-text';
        var orig = msg.reply_to_message || '…';
        qt.textContent = orig.length > 70 ? orig.substring(0, 70) + '…' : orig;
        q.appendChild(qu); q.appendChild(qt);
        (function (rid) {
            q.addEventListener('click', function () {
                var target = document.querySelector('[data-message-id="' + rid + '"]');
                if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); flashHighlight(target); }
            });
        }(msg.reply_to_message_id));
        wrap.appendChild(q);
    }

    // ── Message text ──
    var txt = document.createElement('div'); txt.className = 'message-text'; txt.textContent = msg.message;
    wrap.appendChild(txt);

    // ── Edited label ──
    if (msg.edited_at) {
        var ed = document.createElement('span'); ed.className = 'ca-edited'; ed.textContent = '(edited)';
        wrap.appendChild(ed);
    }

    // ── Reaction bubbles ──
    var rxKeys = Object.keys(rxCounts);
    if (rxKeys.length) {
        var rxDiv = document.createElement('div'); rxDiv.className = 'message-reactions';
        rxKeys.forEach(function (emoji) {
            var b = document.createElement('span');
            b.className = 'reaction-bubble' + (userHas[emoji] ? ' active' : '');
            b.title     = userHas[emoji] ? 'Remove reaction' : 'React';
            b.appendChild(document.createTextNode(emoji + ' '));
            var cnt = document.createElement('span'); cnt.className = 'reaction-count'; cnt.textContent = rxCounts[emoji];
            b.appendChild(cnt);
            (function (id, em) {
                b.addEventListener('click', function () { toggleReaction(id, em); });
            }(msg.id, emoji));
            rxDiv.appendChild(b);
        });
        wrap.appendChild(rxDiv);
    }

    // ── Quick actions row ──
    var actions = document.createElement('div'); actions.className = 'message-actions';

    if (!isOwn) {
        QUICK_EMOJIS.forEach(function (emoji) {
            var btn = document.createElement('button');
            btn.className   = 'quick-react-btn'; btn.title = 'React with ' + emoji; btn.textContent = emoji;
            (function (id, em) { btn.addEventListener('click', function () { reactToMessage(id, em); }); }(msg.id, emoji));
            actions.appendChild(btn);
        });
    }

    var rb = document.createElement('button'); rb.className = 'reply-btn'; rb.title = 'Reply'; rb.textContent = '↩️';
    (function (id, uname, text) {
        rb.addEventListener('click', function () { replyToMessage(id, uname, text); });
    }(msg.id, msg.username, msg.message));
    actions.appendChild(rb);
    wrap.appendChild(actions);

    // Touch: tap message body to toggle action row
    wrap.addEventListener('touchstart', function (e) {
        if (e.target.closest('.message-actions,.reaction-bubble,.ca-reply-quote')) return;
        actions.style.display = actions.style.display === 'flex' ? 'none' : 'flex';
    }, { passive: true });

    // Context menu
    attachCtxMenu(wrap, msg, isOwn);
    return wrap;
}

// ── 11. CONTEXT MENU ───────────────────────────────────────────
function attachCtxMenu(el, msg, isOwn) {
    el.addEventListener('contextmenu', function (e) {
        e.preventDefault(); openCtxMenu(e.clientX, e.clientY, msg, isOwn);
    });
    el.addEventListener('touchstart', function (e) {
        if (e.target.closest('.message-actions,.reaction-bubble,.quick-react-btn,.reply-btn')) return;
        longPressTimer = setTimeout(function () {
            var t = e.touches[0]; openCtxMenu(t.clientX, t.clientY, msg, isOwn);
        }, 500);
    }, { passive: true });
    el.addEventListener('touchend',  function () { clearTimeout(longPressTimer); });
    el.addEventListener('touchmove', function () { clearTimeout(longPressTimer); });
}

function openCtxMenu(x, y, msg, isOwn) {
    closeCtxMenu(); if (msg.is_deleted) return;
    var menu = document.getElementById('ca-ctx-menu'); if (!menu) return;
    menu.innerHTML = '';

    var items = [
        { label: '↩️ Reply',   fn: function () { replyToMessage(msg.id, msg.username, msg.message); } },
        { label: '📋 Copy',    fn: function () {
            var fb = function () { var ta = document.createElement('textarea'); ta.value = msg.message; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); };
            navigator.clipboard ? navigator.clipboard.writeText(msg.message).catch(fb) : fb();
            showRpNotification('Copied!');
        }},
        { label: '⮂ Forward', fn: function () { forwardMessage(msg); } }
    ];
    if (isOwn)                 items.push({ label: '✏️ Edit',   fn: function () { beginEdit(msg.id, msg.message); } });
    if (isOwn || isPrivileged()) items.push({ label: '🗑 Delete', fn: function () { deleteMessage(msg.id); }, danger: true });
    if (isPrivileged())          items.push({ label: '📌 Pin',    fn: function () { pinMessage(msg.id); } });

    items.forEach(function (item) {
        var btn = document.createElement('button');
        btn.className   = 'ca-ctx-item' + (item.danger ? ' ca-ctx-danger' : '');
        btn.textContent = item.label;
        btn.addEventListener('click', function () { item.fn(); closeCtxMenu(); });
        menu.appendChild(btn);
    });

    var mW = 190, mH = items.length * 44;
    menu.style.left    = Math.max(5, Math.min(x, window.innerWidth  - mW - 10)) + 'px';
    menu.style.top     = Math.max(5, Math.min(y, window.innerHeight - mH - 10)) + 'px';
    menu.style.display = 'block';

    setTimeout(function () {
        document.addEventListener('click',      closeCtxMenu, { once: true });
        document.addEventListener('touchstart', closeCtxMenu, { once: true });
    }, 50);
}
function closeCtxMenu() {
    var m = document.getElementById('ca-ctx-menu'); if (m) m.style.display = 'none';
}

// ── 12. EDIT ───────────────────────────────────────────────────
function beginEdit(messageId, currentText) {
    var el = document.querySelector('[data-message-id="' + messageId + '"]'); if (!el) return;
    var textDiv = el.querySelector('.message-text'); if (!textDiv) return;

    var inp = document.createElement('input'); inp.type = 'text';
    inp.className = 'ca-edit-input'; inp.value = currentText; inp.maxLength = 500;

    var saveBtn = document.createElement('button'); saveBtn.className = 'ca-edit-save'; saveBtn.textContent = '✓ Save';
    var cancelBtn = document.createElement('button'); cancelBtn.className = 'ca-edit-cancel'; cancelBtn.textContent = '✕';

    var row = document.createElement('div'); row.className = 'ca-edit-row';
    row.appendChild(inp); row.appendChild(saveBtn); row.appendChild(cancelBtn);
    textDiv.replaceWith(row); inp.focus(); inp.select();

    var doSave   = function () { commitEdit(messageId, inp.value.trim()); };
    var doCancel = function () { loadMessages(); };
    saveBtn.addEventListener('click', doSave); cancelBtn.addEventListener('click', doCancel);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSave(); if (e.key === 'Escape') doCancel(); });
}
async function commitEdit(messageId, newText) {
    var user = getCurrentUser(); if (!user || !newText) { loadMessages(); return; }
    try {
        var res  = await fetch(window.API_ENDPOINTS.chatEdit, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, message_id: messageId, new_message: newText })
        });
        var data = await res.json();
        if (!data.success) alert(data.error || 'Edit failed');
    } catch (e) { console.error('Edit error:', e); }
    await loadMessages();
}

// ── 13. DELETE ─────────────────────────────────────────────────
async function deleteMessage(messageId) {
    var user = getCurrentUser(); if (!user) return;
    if (!confirm('Delete this message?')) return;
    try {
        var res  = await fetch(window.API_ENDPOINTS.chatDelete, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, message_id: messageId })
        });
        var data = await res.json();
        if (data.success) await loadMessages(); else alert(data.error || 'Delete failed');
    } catch (e) { console.error('Delete error:', e); }
}

// ── 14. FORWARD ────────────────────────────────────────────────
async function forwardMessage(msg) {
    var user = getCurrentUser(); if (!user) { alert('Please login first'); return; }
    var preview = msg.message.length > 80 ? msg.message.substring(0, 80) + '…' : msg.message;
    if (!confirm('Forward this message?\n"' + preview + '"')) return;
    try {
        var res  = await fetch(window.API_ENDPOINTS.chatSend, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id, username: user.username, message: msg.message,
                forwarded_from_username: msg.username,
                reply_to_message_id: null, reply_to_username: null,
                reply_to_message: null, image_url: null
            })
        });
        var data = await res.json();
        if (data.success) { await loadMessages(); forceScrollToBottom(); if (data.rp_earned) showRpNotification('+' + data.rp_earned + ' RP'); }
        else alert(data.error || 'Forward failed');
    } catch (e) { console.error('Forward error:', e); }
}

// ── 15. PIN ────────────────────────────────────────────────────
async function pinMessage(messageId) {
    var user = getCurrentUser(); if (!user || !isPrivileged()) return;
    try {
        var res  = await fetch(window.API_ENDPOINTS.chatPin, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, message_id: messageId, action: 'pin' })
        });
        var data = await res.json();
        if (data.success) await loadMessages(); else alert(data.error || 'Pin failed');
    } catch (e) { console.error('Pin error:', e); }
}

// ── 16. REACTIONS ──────────────────────────────────────────────
async function reactToMessage(messageId, emoji) {
    var user = getCurrentUser(); if (!user) { alert('Please login to react'); return; }
    try {
        var res  = await fetch(window.API_ENDPOINTS.chatReact, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, message_id: messageId, emoji: emoji })
        });
        var data = await res.json();
        if (data.success) {
            await loadMessages(); await loadUserStats();
            if (data.rp_earned && data.action === 'added') showRpNotification('+1 RP');
        } else if (data.error && !data.error.includes('own message')) {
            alert(data.error);
        }
    } catch (e) { console.error('React error:', e); }
}
async function toggleReaction(messageId, emoji) { await reactToMessage(messageId, emoji); }

// ── 17. REPLY ──────────────────────────────────────────────────
function replyToMessage(messageId, username, messageText) {
    replyingTo = { messageId: messageId, username: username, messageText: messageText };
    var input = document.getElementById('message-input');
    if (input) { input.placeholder = 'Replying to ' + username + '…'; input.focus(); }

    var wrapper = document.querySelector('.chat-input-wrapper');
    var bar = document.getElementById('ca-reply-bar');
    if (!bar) {
        bar = document.createElement('div'); bar.id = 'ca-reply-bar'; bar.className = 'ca-reply-bar';
        wrapper.parentElement.insertBefore(bar, wrapper);
    }
    bar.innerHTML = '';
    var us = document.createElement('span'); us.className = 'ca-reply-bar-user'; us.textContent = '↩️ ' + username;
    var ts = document.createElement('span'); ts.className = 'ca-reply-bar-text';
    var t  = messageText || ''; ts.textContent = t.length > 60 ? t.substring(0, 60) + '…' : t;
    var xb = document.createElement('button'); xb.className = 'ca-reply-bar-cancel'; xb.textContent = '✕';
    xb.addEventListener('click', cancelReply);
    bar.appendChild(us); bar.appendChild(ts); bar.appendChild(xb);
}
function cancelReply() {
    replyingTo = null;
    var input = document.getElementById('message-input');
    if (input) input.placeholder = 'Type your message…';
    var bar = document.getElementById('ca-reply-bar'); if (bar) bar.remove();
}

// ── 18. SEARCH ─────────────────────────────────────────────────
function openSearch() {
    var ov = document.getElementById('ca-search-overlay'); if (ov) ov.style.display = 'flex';
    setTimeout(function () { var i = document.getElementById('ca-search-input'); if (i) i.focus(); }, 80);
}
function closeSearch() {
    var ov = document.getElementById('ca-search-overlay'); if (ov) ov.style.display = 'none';
    var r  = document.getElementById('ca-search-results'); if (r) r.innerHTML = '';
    var i  = document.getElementById('ca-search-input');  if (i) i.value = '';
}
async function handleSearch(query) {
    clearTimeout(searchDebounce);
    var rEl = document.getElementById('ca-search-results'); if (!rEl) return;
    if (!query || query.length < 2) { rEl.innerHTML = ''; return; }
    searchDebounce = setTimeout(async function () {
        rEl.innerHTML = '<div class="ca-search-status">🔍 Searching…</div>';
        try {
            var res  = await fetch(window.API_ENDPOINTS.chatSearch + '?q=' + encodeURIComponent(query) + '&limit=20');
            var data = await res.json();
            if (data.success && data.messages && data.messages.length)
                renderSearchResults(data.messages, query, rEl);
            else rEl.innerHTML = '<div class="ca-search-status">No results found</div>';
        } catch (e) { rEl.innerHTML = '<div class="ca-search-status">Search unavailable</div>'; }
    }, SEARCH_DEBOUNCE_MS);
}
function renderSearchResults(messages, query, container) {
    container.innerHTML = '';
    var safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    messages.forEach(function (msg) {
        var item = document.createElement('div'); item.className = 'ca-search-item';
        var hl   = escapeHtml(msg.message).replace(new RegExp(safe, 'gi'), function (m) {
            return '<mark class="ca-search-hit">' + m + '</mark>';
        });
        var u  = document.createElement('div'); u.className = 'ca-search-user'; u.textContent = msg.username;
        var tx = document.createElement('div'); tx.className = 'ca-search-text'; tx.innerHTML = hl;
        var ts = document.createElement('div'); ts.className = 'ca-search-time'; ts.textContent = formatTime(msg.created_date);
        item.appendChild(u); item.appendChild(tx); item.appendChild(ts);
        item.addEventListener('click', function () {
            closeSearch();
            setTimeout(function () {
                var el = document.querySelector('[data-message-id="' + msg.id + '"]');
                if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); flashHighlight(el); }
                else showRpNotification('Message not in current view');
            }, 300);
        });
        container.appendChild(item);
    });
}

// ── 19. SEND ───────────────────────────────────────────────────
async function sendMessage() {
    var user = getCurrentUser(); if (!user) { alert('Please login first'); return; }
    var input   = document.getElementById('message-input');
    var sendBtn = document.getElementById('send-btn');
    var messageText = input.value.trim();
    if (!messageText && !attachedFile) return;
    if (messageText.length > 500) { alert('Message too long (max 500 characters)'); return; }

    var reply_to_message_id = null, reply_to_username = null, reply_to_message = null;
    var forwarded_from_username = null, image_url = null;

    if (replyingTo) {
        reply_to_message_id = replyingTo.messageId; reply_to_username = replyingTo.username;
        reply_to_message    = replyingTo.messageText;
        if (messageText) messageText = '@' + replyingTo.username + ' ' + messageText;
        cancelReply();
    }
    if (attachedFile) {
        messageText = attachedFile.type.startsWith('image/')
            ? (messageText || 'Shared an image')
            : ((messageText || 'Shared a file') + ' [' + attachedFile.name + ']');
        removeAttachment();
    }

    sendBtn.disabled = true; sendBtn.textContent = 'SENDING…';
    try {
        var res  = await fetch(window.API_ENDPOINTS.chatSend, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id, username: user.username, message: messageText,
                reply_to_message_id: reply_to_message_id, reply_to_username: reply_to_username,
                reply_to_message: reply_to_message, forwarded_from_username: forwarded_from_username,
                image_url: image_url
            })
        });
        var data = await res.json();
        if (data.success) {
            input.value = ''; updateCharCount();
            await loadMessages(); await loadUserStats(); forceScrollToBottom();
            if (data.rp_earned) showRpNotification('+' + data.rp_earned + ' RP');
        } else { alert('Failed to send: ' + (data.error || 'Unknown error')); }
    } catch (e) { console.error('Send error:', e); alert('Failed to send message'); }
    finally { sendBtn.disabled = false; sendBtn.textContent = 'SEND'; }
}

// ── 20. ATTACHMENTS ────────────────────────────────────────────
function handleAttachment() { var fi = document.getElementById('file-input'); if (fi) fi.click(); }
function handleFileSelect(event) {
    var file = event.target.files[0]; if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File too large! Max: 10MB'); return; }
    attachedFile = file; showAttachmentPreview(file);
}
function showAttachmentPreview(file) {
    var wrapper = document.querySelector('.chat-input-wrapper');
    var ex = document.querySelector('.attachment-preview'); if (ex) ex.remove();
    var preview = document.createElement('div'); preview.className = 'attachment-preview';
    preview.innerHTML = '<span class="file-icon">' + getFileIcon(file.type, file.name) + '</span>' +
        '<div class="file-info"><div class="file-name">' + escapeHtml(file.name) + '</div>' +
        '<div class="file-size">' + formatFileSize(file.size) + '</div></div>' +
        '<button class="remove-btn" onclick="window.removeAttachment()">✕</button>';
    wrapper.parentElement.insertBefore(preview, wrapper);
}
function removeAttachment() {
    attachedFile = null;
    var p = document.querySelector('.attachment-preview'); if (p) p.remove();
    var fi = document.getElementById('file-input'); if (fi) fi.value = '';
}
function getFileIcon(type, name) {
    if (type.startsWith('image/')) return '🖼️'; if (name.endsWith('.gif')) return '🎬';
    if (name.endsWith('.pdf')) return '📄'; if (name.endsWith('.html')) return '🌐';
    if (name.endsWith('.txt')) return '📝'; if (name.match(/\.(js|css|json)$/)) return '💻';
    return '📎';
}
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

// ── 21. EMOJI PICKER ───────────────────────────────────────────
function showEmojiPicker() {
    if (document.getElementById('emoji-picker')) { hideEmojiPicker(); return; }
    var picker = document.createElement('div'); picker.id = 'emoji-picker';
    ALL_EMOJIS.forEach(function (emoji) {
        var btn = document.createElement('button'); btn.textContent = emoji; btn.className = 'emoji-picker-btn';
        btn.addEventListener('click', function () { insertEmoji(emoji); }); picker.appendChild(btn);
    });
    document.body.appendChild(picker);
    setTimeout(function () {
        document.addEventListener('click', function out(e) {
            var eb = document.getElementById('emoji-btn');
            if (picker && !picker.contains(e.target) && e.target !== eb) { hideEmojiPicker(); document.removeEventListener('click', out); }
        });
    }, 100);
}
function hideEmojiPicker() { var p = document.getElementById('emoji-picker'); if (p) p.remove(); }
function insertEmoji(emoji) {
    var input = document.getElementById('message-input'); if (!input) return;
    var s = input.selectionStart, e = input.selectionEnd;
    input.value = input.value.substring(0, s) + emoji + input.value.substring(e);
    input.selectionStart = input.selectionEnd = s + emoji.length;
    input.focus(); updateCharCount(); hideEmojiPicker();
}

// ── 22. MISC UI ────────────────────────────────────────────────
function showRpNotification(text) {
    var n = document.createElement('div'); n.className = 'rp-notification'; n.textContent = text;
    document.body.appendChild(n);
    setTimeout(function () {
        n.style.opacity = '0'; n.style.transform = 'translateX(100%)';
        setTimeout(function () { n.remove(); }, 300);
    }, 2000);
}
function updateCharCount() {
    var i = document.getElementById('message-input'); var c = document.getElementById('charCount');
    if (i && c) c.textContent = i.value.length;
}
function updateChatUI() {
    var user = getCurrentUser();
    var mi = document.getElementById('message-input');
    var sb = document.getElementById('send-btn');
    var ab = document.getElementById('attach-btn');
    if (user) {
        if (mi) { mi.disabled = false; mi.placeholder = 'Type your message…'; }
        if (sb) sb.disabled = false; if (ab) ab.disabled = false;
        updateProfileDisplay(); loadUserStats();
    } else {
        if (mi) { mi.disabled = true; mi.placeholder = 'Please login to chat'; }
        if (sb) sb.disabled = true; if (ab) ab.disabled = true;
    }
}

// ── 23. INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    var sb = document.getElementById('send-btn');
    if (sb) sb.addEventListener('click', sendMessage);

    var mi = document.getElementById('message-input');
    if (mi) {
        mi.addEventListener('keypress', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
        mi.addEventListener('input', function () { updateCharCount(); sendTypingPing(); });
    }

    var eb = document.getElementById('emoji-btn');
    if (eb) eb.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); showEmojiPicker(); });
    var ab = document.getElementById('attach-btn');
    if (ab) ab.addEventListener('click', function (e) { e.preventDefault(); handleAttachment(); });
    var fi = document.getElementById('file-input');
    if (fi) fi.addEventListener('change', handleFileSelect);

    var srchBtn = document.getElementById('ca-search-btn');
    if (srchBtn) srchBtn.addEventListener('click', openSearch);
    var closeSrch = document.getElementById('ca-close-search');
    if (closeSrch) closeSrch.addEventListener('click', closeSearch);
    var srchIn = document.getElementById('ca-search-input');
    if (srchIn) {
        srchIn.addEventListener('input', function (e) { handleSearch(e.target.value); });
        srchIn.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSearch(); });
    }

    var ub = document.getElementById('ca-unpin-btn');
    if (ub) ub.addEventListener('click', function (e) { e.stopPropagation(); unpinMessage(); });

    var mc = document.getElementById('messages-container');
    if (mc) mc.addEventListener('scroll', closeCtxMenu);

    initScrollBtn();
    updateChatUI();
    loadMessages();
    setInterval(loadMessages,  POLL_MS);
    setInterval(loadUserStats, 10000);
});

window.addEventListener('userLoggedIn',  function () { updateChatUI(); loadMessages(); loadUserStats(); });
window.addEventListener('userLoggedOut', function () { updateChatUI(); });

// ── 24. GLOBAL EXPORTS ─────────────────────────────────────────
window.sendMessage      = sendMessage;
window.reactToMessage   = reactToMessage;
window.toggleReaction   = toggleReaction;
window.replyToMessage   = replyToMessage;
window.cancelReply      = cancelReply;
window.showEmojiPicker  = showEmojiPicker;
window.insertEmoji      = insertEmoji;
window.removeAttachment = removeAttachment;
window.deleteMessage    = deleteMessage;
window.forwardMessage   = forwardMessage;
window.pinMessage       = pinMessage;
window.openSearch       = openSearch;
window.closeSearch      = closeSearch;
