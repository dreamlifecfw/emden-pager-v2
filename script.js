"use strict";

/* =========================
   EMDEN PAGER
========================= */

var NORMAL_SEND_CODE = "1889";
var NORMAL_DECODE_CODE = "1900";
var PS5_CODE = "5576";
var PS5_DECODE_CODE = "5567";

var SUPABASE_URL =
    "https://hmwnhwfjffkxmufripok.supabase.co";

var SUPABASE_KEY =
    "sb_publishable_YdLIkiNahtrG0AFSX7iVVA__nYrwICs";


/* =========================
   العناصر
========================= */

var warning = document.getElementById("warning");
var agreeBtn = document.getElementById("agreeBtn");
var timerEl = document.getElementById("timer");

var app = document.getElementById("app");

var modal = document.getElementById("modal");
var modalTitle = document.getElementById("modalTitle");

var codeStep = document.getElementById("codeStep");
var sendStep = document.getElementById("sendStep");
var decodeStep = document.getElementById("decodeStep");
var ps5Step = document.getElementById("ps5Step");

var codeDisplay = document.getElementById("codeDisplay");
var keypad = document.getElementById("keypad");

var enteredCode = "";
var mode = "";
var selectedPS5Message = "";

var cooldownRunning = false;


/* =========================
   Supabase
========================= */

var supabaseClient = null;
var realtimeChannel = null;

try {

    if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
    ) {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        console.log("Supabase جاهز");

    }

} catch (error) {

    console.log("Supabase Error:", error);

}


/* =========================
   عداد الـ 5 ثواني
========================= */

var seconds = 5;

if (agreeBtn) {

    agreeBtn.disabled = true;

    var countdown = setInterval(function () {

        seconds--;

        if (seconds <= 0) {

            clearInterval(countdown);

            agreeBtn.disabled = false;

            agreeBtn.style.pointerEvents = "auto";
            agreeBtn.style.opacity = "1";

            if (timerEl) {
                timerEl.textContent = "";
            }

        } else {

            if (timerEl) {
                timerEl.textContent = seconds;
            }

        }

    }, 1000);


    agreeBtn.addEventListener("click", function () {

        warning.classList.add("hidden");
        app.classList.remove("hidden");

        loadMessages();
        startRealtime();

    });

}


/* =========================
   الترميز
========================= */

var alphabet = {

    "ا": "01",
    "ب": "02",
    "ت": "03",
    "ث": "04",
    "ج": "05",
    "ح": "06",
    "خ": "07",
    "د": "08",
    "ذ": "09",
    "ر": "10",
    "ز": "11",
    "س": "12",
    "ش": "13",
    "ص": "14",
    "ض": "15",
    "ط": "16",
    "ظ": "17",
    "ع": "18",
    "غ": "19",
    "ف": "20",
    "ق": "21",
    "ك": "22",
    "ل": "23",
    "م": "24",
    "ن": "25",
    "ه": "26",
    "و": "27",
    "ي": "28",
    "ء": "29",
    "ى": "30",
    "ة": "31",
    "ئ": "32",
    "ؤ": "33",
    " ": "00"

};

var reverseAlphabet = {};

Object.keys(alphabet).forEach(function (letter) {

    reverseAlphabet[alphabet[letter]] = letter;

});


function encodeMessage(text) {

    var result = "";

    for (var i = 0; i < text.length; i++) {

        var char = text.charAt(i);

        if (alphabet[char]) {

            result += alphabet[char];

        } else {

            result += "??";

        }

    }

    return result;

}


function decodeMessage(numbers) {

    var clean = String(numbers || "")
        .replace(/\s/g, "");

    if (!clean) {
        return "أدخل أرقام أولاً.";
    }

    if (!/^\d+$/.test(clean)) {
        return "أدخل أرقام فقط.";
    }

    if (clean.length % 2 !== 0) {
        return "الشفرة غير مكتملة.";
    }

    var result = "";

    for (var i = 0; i < clean.length; i += 2) {

        var pair = clean.substring(i, i + 2);

        result += reverseAlphabet[pair] || "؟";

    }

    return result;

}


/* =========================
   فتح النافذة
========================= */

function openModal(type) {

    mode = type;
    enteredCode = "";

    codeDisplay.textContent = "";

    codeStep.classList.remove("hidden");
    sendStep.classList.add("hidden");
    decodeStep.classList.add("hidden");
    ps5Step.classList.add("hidden");

    if (type === "send") {

        modalTitle.textContent = "إرسال رسالة";

    } else if (type === "decode") {

        modalTitle.textContent = "فك الشفرة";

    } else if (type === "ps5") {

        modalTitle.textContent = "🎮 نظام PS5";

    }

    modal.classList.remove("hidden");

}


/* =========================
   الأزرار الرئيسية
========================= */

var sendOpen = document.getElementById("sendOpen");

if (sendOpen) {

    sendOpen.addEventListener("click", function () {

        openModal("send");

    });

}


var decodeOpen = document.getElementById("decodeOpen");

if (decodeOpen) {

    decodeOpen.addEventListener("click", function () {

        openModal("decode");

    });

}


var ps5Open = document.getElementById("ps5Open");

if (ps5Open) {

    ps5Open.addEventListener("click", function () {

        openModal("ps5");

    });

}


/* =========================
   إغلاق
========================= */

var closeModal = document.getElementById("closeModal");

if (closeModal) {

    closeModal.addEventListener("click", function () {

        modal.classList.add("hidden");

    });

}


/* =========================
   لوحة الأرقام
========================= */

function createKey(number) {

    var button = document.createElement("button");

    button.type = "button";
    button.textContent = number;

    button.addEventListener("click", function () {

        if (enteredCode.length >= 4) {
            return;
        }

        enteredCode += String(number);

        codeDisplay.textContent =
            "•".repeat(enteredCode.length);

        if (enteredCode.length === 4) {

            checkCode();

        }

    });

    keypad.appendChild(button);

}


for (var k = 1; k <= 9; k++) {

    createKey(k);

}

createKey(0);


/* =========================
   مسح الرمز
========================= */

document.getElementById("clearCode")
    .addEventListener("click", function () {

        enteredCode = "";
        codeDisplay.textContent = "";

    });


/* =========================
   التحقق من الرموز
========================= */

function checkCode() {

    var correctCode = "";

    if (mode === "send") {

        correctCode = NORMAL_SEND_CODE;

    } else if (mode === "decode") {

        correctCode = NORMAL_DECODE_CODE;

    } else if (mode === "ps5") {

        correctCode = PS5_CODE;

    } else {

        return;

    }


    if (enteredCode !== correctCode) {

        alert("الرمز غير صحيح");

        enteredCode = "";
        codeDisplay.textContent = "";

        return;

    }


    codeStep.classList.add("hidden");


    if (mode === "send") {

        sendStep.classList.remove("hidden");

        modalTitle.textContent = "إرسال رسالة";

    }


    if (mode === "decode") {

        decodeStep.classList.remove("hidden");

        modalTitle.textContent = "فك الشفرة";

    }


    if (mode === "ps5") {

        ps5Step.classList.remove("hidden");

        modalTitle.textContent = "🎮 إرسال رسالة PS5";

    }

}


/* =========================
   إرسال عادي
========================= */

var sendBtn = document.getElementById("sendBtn");

if (sendBtn) {

    sendBtn.addEventListener("click", function () {

        sendMessage(
            document.getElementById("messageInput")
        );

    });

}


/* =========================
   إرسال PS5
========================= */

var ps5SendBtn =
    document.getElementById("ps5SendBtn");

if (ps5SendBtn) {

    ps5SendBtn.addEventListener("click", function () {

        sendMessage(
            document.getElementById("ps5MessageInput")
        );

    });

}


/* =========================
   إرسال إلى Supabase
========================= */

async function sendMessage(input) {

    if (cooldownRunning) {
        return;
    }

    if (!supabaseClient) {

        alert("الاتصال بالسيرفر غير جاهز.");

        return;

    }

    if (!input) {

        alert("حقل الرسالة غير موجود.");

        return;

    }

    var message = input.value.trim();

    if (!message) {

        alert("اكتب الرسالة أولاً.");

        return;

    }

    var encoded = encodeMessage(message);


    try {

        var result =
            await supabaseClient
                .from("messages")
                .insert({
                    encoded_text: encoded
                })
                .select()
                .single();


        if (result.error) {

            console.log(
                "Supabase Insert Error:",
                result.error
            );

            alert(
                "تعذر إرسال الرسالة."
            );

            return;

        }


        /*
           نعرض الرسالة فورًا عند المرسل.
        */

        addMessageToPager(
            encoded,
            true
        );


        input.value = "";

        startCooldown();


        /*
           إغلاق النافذة بعد الإرسال
        */

        modal.classList.add("hidden");


    } catch (error) {

        console.log(
            "Send Error:",
            error
        );

        alert(
            "حدث خطأ أثناء الإرسال."
        );

    }

}


/* =========================
   مؤقت الإرسال
========================= */

function startCooldown() {

    cooldownRunning = true;

    var cooldown =
        document.getElementById("cooldown");

    var remaining = 20;

    if (cooldown) {

        cooldown.textContent =
            "انتظر " +
            remaining +
            " ثانية قبل إرسال رسالة أخرى";

    }


    var interval = setInterval(function () {

        remaining--;

        if (remaining <= 0) {

            clearInterval(interval);

            cooldownRunning = false;

            if (cooldown) {

                cooldown.textContent =
                    "يمكنك إرسال رسالة جديدة.";

            }

        } else {

            if (cooldown) {

                cooldown.textContent =
                    "انتظر " +
                    remaining +
                    " ثانية قبل إرسال رسالة أخرى";

            }

        }

    }, 1000);

}


/* =========================
   تحميل الرسائل
========================= */

async function loadMessages() {

    if (!supabaseClient) {
        return;
    }

    try {

        var result =
            await supabaseClient
                .from("messages")
                .select(
                    "id, encoded_text, created_at"
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                )
                .limit(50);


        if (result.error) {

            console.log(
                "Load Error:",
                result.error
            );

            return;

        }


        var messages =
            document.getElementById("messages");

        messages.innerHTML = "";


        if (!result.data || result.data.length === 0) {

            var empty =
                document.createElement("div");

            empty.className = "empty";
            empty.textContent =
                "لا توجد رسائل حالياً";

            messages.appendChild(empty);

            return;

        }


        result.data.forEach(function (row) {

            addMessageToPager(
                row.encoded_text,
                false
            );

        });


    } catch (error) {

        console.log(
            "Load Error:",
            error
        );

    }

}


/* =========================
   Realtime
========================= */

function startRealtime() {

    if (!supabaseClient || realtimeChannel) {
        return;
    }


    realtimeChannel =
        supabaseClient
            .channel("emden-messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages"
                },
                function (payload) {

                    if (
                        payload &&
                        payload.new &&
                        payload.new.encoded_text
                    ) {

                        addMessageToPager(
                            payload.new.encoded_text,
                            true
                        );

                    }

                }
            )
            .subscribe(function (status) {

                console.log(
                    "Realtime:",
                    status
                );

            });

}


/* =========================
   إضافة الرسالة
========================= */

function addMessageToPager(
    encoded,
    scroll
) {

    var messages =
        document.getElementById("messages");

    if (!messages) {
        return;
    }


    var empty =
        messages.querySelector(".empty");

    if (empty) {
        empty.remove();
    }


    var box =
        document.createElement("div");

    box.className = "message";


    var numbers =
        document.createElement("div");

    numbers.className =
        "message-numbers";

    numbers.textContent =
        encoded;


    /* نسخ */

    var copy =
        document.createElement("button");

    copy.className = "copy";
    copy.type = "button";
    copy.textContent = "نسخ الأرقام";

    copy.addEventListener(
        "click",
        function () {

            copyText(
                encoded,
                copy
            );

        }
    );


    /* فك الشفرة */

    var decode =
        document.createElement("button");

    decode.className = "copy";
    decode.type = "button";
    decode.textContent =
        "🎮 فك الشفرة";


    decode.addEventListener(
        "click",
        function () {

            openMessageDecode(
                encoded
            );

        }
    );


    box.appendChild(numbers);
    box.appendChild(copy);
    box.appendChild(decode);


    messages.appendChild(box);


    if (scroll) {

        try {

            box.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        } catch (error) {}

    }

}


/* =========================
   فك شفرة رسالة
========================= */

function openMessageDecode(encoded) {

    selectedPS5Message = encoded;

    enteredCode = "";

    mode = "messageDecode";

    codeDisplay.textContent = "";

    codeStep.classList.remove("hidden");

    sendStep.classList.add("hidden");
    decodeStep.classList.add("hidden");
    ps5Step.classList.add("hidden");

    modalTitle.textContent =
        "🎮 فك شفرة الرسالة";

    modal.classList.remove("hidden");

}


/* =========================
   تعديل checkCode لفك رسالة
========================= */

var oldCheckCode = checkCode;

checkCode = function () {

    if (mode !== "messageDecode") {

        oldCheckCode();

        return;

    }


    if (enteredCode !== PS5_DECODE_CODE) {

        alert("الرمز غير صحيح");

        enteredCode = "";
        codeDisplay.textContent = "";

        return;

    }


    codeStep.classList.add("hidden");

    decodeStep.classList.remove("hidden");

    modalTitle.textContent =
        "🎮 فك شفرة الرسالة";


    var numberInput =
        document.getElementById(
            "numberInput"
        );

    var decodeResult =
        document.getElementById(
            "decodeResult"
        );


    numberInput.value =
        selectedPS5Message;


    decodeResult.textContent =
        decodeMessage(
            selectedPS5Message
        );

};


/* =========================
   فك الشفرة العادي
========================= */

var decodeBtn =
    document.getElementById("decodeBtn");

if (decodeBtn) {

    decodeBtn.addEventListener(
        "click",
        function () {

            var numbers =
                document
                    .getElementById("numberInput")
                    .value
                    .trim();


            document
                .getElementById("decodeResult")
                .textContent =
                    decodeMessage(numbers);

        }
    );

}


/* =========================
   النسخ
========================= */

function copyText(text, button) {

    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        navigator.clipboard
            .writeText(text)
            .then(function () {

                button.textContent =
                    "تم النسخ ✓";

                setTimeout(function () {

                    button.textContent =
                        "نسخ الأرقام";

                }, 1500);

            })
            .catch(function () {

                oldCopy(text, button);

            });

    } else {

        oldCopy(text, button);

    }

}


function oldCopy(text, button) {

    var textarea =
        document.createElement("textarea");

    textarea.value = text;

    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    try {

        document.execCommand("copy");

        button.textContent =
            "تم النسخ ✓";

    } catch (error) {

        alert("انسخ الأرقام يدويًا.");

    }

    document.body.removeChild(textarea);

}


/* =========================
   جاهز
========================= */

console.log(
    "Emden Pager: Script loaded successfully"
);
