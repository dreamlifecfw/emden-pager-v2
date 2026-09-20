const warning = document.getElementById("warning");
const agreeBtn = document.getElementById("agreeBtn");
const timerEl = document.getElementById("timer");

// ===============================
// SUPABASE
// ===============================

const SUPABASE_URL = "https://hmwnhwfjffkxmufripok.supabase.co";
const SUPABASE_KEY = "sb_publishable_YdLIkiNahtrG0AFSX7iVVA__nYrwICs";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const pagerChannel = supabaseClient.channel("emden-pager", {
    config: {
        broadcast: {
            self: true
        }
    }
});

let pagerConnected = false;

pagerChannel
    .on("broadcast", { event: "pager_message" }, ({ payload }) => {

        if (!payload || !payload.encoded) return;

        addMessageToPager(payload.encoded);

    })
    .subscribe((status) => {

        if (status === "SUBSCRIBED") {
            pagerConnected = true;
            console.log("Supabase Realtime متصل");
        }

    });


// ===============================
// إخفاء رمز الدخول
// ===============================

document.querySelectorAll(".actions small").forEach((item) => {
    item.textContent = "رمز الدخول: ••••";
});


// ===============================
// عداد الموافقة
// ===============================

let seconds = 5;

const countdown = setInterval(() => {

    seconds--;

    if (seconds <= 0) {

        clearInterval(countdown);

        agreeBtn.disabled = false;
        agreeBtn.style.pointerEvents = "auto";
        agreeBtn.style.opacity = "1";

        timerEl.textContent = "";

    } else {

        timerEl.textContent = seconds;

    }

}, 1000);


// ===============================
// زر موافق
// ===============================

agreeBtn.addEventListener("click", () => {

    warning.classList.add("hidden");

    document.getElementById("app").classList.remove("hidden");

});


// ===============================
// النافذة
// ===============================

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");

const codeStep = document.getElementById("codeStep");
const sendStep = document.getElementById("sendStep");
const decodeStep = document.getElementById("decodeStep");

const codeDisplay = document.getElementById("codeDisplay");

let enteredCode = "";
let mode = "";

let cooldownRunning = false;


// ===============================
// فتح النافذة
// ===============================

function openModal(type) {

    mode = type;

    enteredCode = "";

    codeDisplay.textContent = "";

    codeStep.classList.remove("hidden");

    sendStep.classList.add("hidden");

    decodeStep.classList.add("hidden");

    modalTitle.textContent =
        type === "send"
            ? "إرسال رسالة"
            : "فك الشفرة";

    modal.classList.remove("hidden");

}


// ===============================
// أزرار فتح النوافذ
// ===============================

document.getElementById("sendOpen").addEventListener("click", () => {

    openModal("send");

});

document.getElementById("decodeOpen").addEventListener("click", () => {

    openModal("decode");

});


// ===============================
// إغلاق
// ===============================

document.getElementById("closeModal").addEventListener("click", () => {

    modal.classList.add("hidden");

});


// ===============================
// لوحة الأرقام
// ===============================

const keypad = document.getElementById("keypad");

for (let i = 1; i <= 9; i++) {

    createKey(i);

}

createKey(0);


function createKey(number) {

    const button = document.createElement("button");

    button.type = "button";

    button.textContent = number;

    button.addEventListener("click", () => {

        if (enteredCode.length >= 4) return;

        enteredCode += number;

        codeDisplay.textContent =
            "•".repeat(enteredCode.length);

        if (enteredCode.length === 4) {

            checkCode();

        }

    });

    keypad.appendChild(button);

}


// ===============================
// مسح الرمز
// ===============================

document.getElementById("clearCode").addEventListener("click", () => {

    enteredCode = "";

    codeDisplay.textContent = "";

});


// ===============================
// التحقق من الرمز
// ===============================

function checkCode() {

    const correctCode =
        mode === "send"
            ? "1889"
            : "1900";

    if (enteredCode !== correctCode) {

        alert("الرمز غير صحيح");

        enteredCode = "";

        codeDisplay.textContent = "";

        return;

    }

    codeStep.classList.add("hidden");

    if (mode === "send") {

        sendStep.classList.remove("hidden");

    } else {

        decodeStep.classList.remove("hidden");

    }

}


// ===============================
// ترميز الحروف العربية
// ===============================

const alphabet = {

    "ا":"01",
    "ب":"02",
    "ت":"03",
    "ث":"04",
    "ج":"05",
    "ح":"06",
    "خ":"07",
    "د":"08",
    "ذ":"09",
    "ر":"10",
    "ز":"11",
    "س":"12",
    "ش":"13",
    "ص":"14",
    "ض":"15",
    "ط":"16",
    "ظ":"17",
    "ع":"18",
    "غ":"19",
    "ف":"20",
    "ق":"21",
    "ك":"22",
    "ل":"23",
    "م":"24",
    "ن":"25",
    "ه":"26",
    "و":"27",
    "ي":"28",
    "ء":"29",
    "ى":"30",
    "ة":"31",
    "ئ":"32",
    "ؤ":"33",
    " ":"00"

};


const reverseAlphabet = Object.fromEntries(

    Object.entries(alphabet).map(
        ([letter, number]) => [number, letter]
    )

);


// ===============================
// عربي → أرقام
// ===============================

function encodeMessage(text) {

    let result = "";

    for (const character of text) {

        result += alphabet[character] ?? "??";

    }

    return result;

}


// ===============================
// أرقام → عربي
// ===============================

function decodeMessage(numbers) {

    const cleanNumbers =
        numbers.replace(/\s/g, "");

    if (!cleanNumbers) {

        return "أدخل أرقام أولاً.";

    }

    if (!/^\d+$/.test(cleanNumbers)) {

        return "أدخل أرقام فقط.";

    }

    if (cleanNumbers.length % 2 !== 0) {

        return "الشفرة غير مكتملة.";

    }

    let result = "";

    for (
        let i = 0;
        i < cleanNumbers.length;
        i += 2
    ) {

        const pair =
            cleanNumbers.substring(i, i + 2);

        result +=
            reverseAlphabet[pair] || "؟";

    }

    return result;

}


// ===============================
// إضافة رسالة للبيجر
// ===============================

function addMessageToPager(encoded) {

    const messages =
        document.getElementById("messages");

    const empty =
        messages.querySelector(".empty");

    if (empty) {

        empty.remove();

    }

    const messageBox =
        document.createElement("div");

    messageBox.className = "message";

    const numbers =
        document.createElement("div");

    numbers.textContent = encoded;

    const copyButton =
        document.createElement("button");

    copyButton.className = "copy";

    copyButton.type = "button";

    copyButton.textContent = "نسخ الأرقام";


    copyButton.addEventListener("click", async () => {

        try {

            await navigator.clipboard.writeText(encoded);

            copyButton.textContent = "تم النسخ ✓";

            setTimeout(() => {

                copyButton.textContent = "نسخ الأرقام";

            }, 1500);

        } catch {

            alert("تعذر نسخ الأرقام.");

        }

    });


    messageBox.appendChild(numbers);

    messageBox.appendChild(copyButton);

    messages.prepend(messageBox);

}


// ===============================
// إرسال الرسالة للجميع
// ===============================

document.getElementById("sendBtn").addEventListener("click", async () => {

    if (cooldownRunning) return;

    const input =
        document.getElementById("messageInput");

    const message =
        input.value.trim();

    if (!message) {

        alert("اكتب الرسالة أولاً.");

        return;

    }

    if (!pagerConnected) {

        alert("الاتصال بالسيرفر غير جاهز، حاول بعد ثواني.");

        return;

    }

    const encoded =
        encodeMessage(message);


    try {

        const result =
            await pagerChannel.send({

                type: "broadcast",

                event: "pager_message",

                payload: {
                    encoded: encoded
                }

            });


        if (result !== "ok") {

            console.error(result);

            alert("تعذر إرسال الرسالة.");

            return;

        }


        input.value = "";


        // 20 ثانية انتظار

        cooldownRunning = true;

        const cooldown =
            document.getElementById("cooldown");

        let remaining = 20;

        cooldown.textContent =
            `انتظر ${remaining} ثانية قبل إرسال رسالة أخرى`;


        const interval =
            setInterval(() => {

                remaining--;

                if (remaining <= 0) {

                    clearInterval(interval);

                    cooldownRunning = false;

                    cooldown.textContent =
                        "يمكنك إرسال رسالة جديدة.";

                } else {

                    cooldown.textContent =
                        `انتظر ${remaining} ثانية قبل إرسال رسالة أخرى`;

                }

            }, 1000);


    } catch (error) {

        console.error(error);

        alert("حدث خطأ أثناء إرسال الرسالة.");

    }

});


// ===============================
// فك الشفرة
// ===============================

document.getElementById("decodeBtn").addEventListener("click", () => {

    const numbers =
        document.getElementById("numberInput").value.trim();

    const result =
        decodeMessage(numbers);

    document.getElementById("decodeResult").textContent =
        result;

});
