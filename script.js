"use strict";

// ===============================
// EMDEN PAGER - script.js
// ===============================

// رموز الدخول
const NORMAL_SEND_CODE = "1889";
const NORMAL_DECODE_CODE = "1900";
const PS5_CODE = "5576";
const PS5_DECODE_CODE = "5567";

// ===============================
// SUPABASE
// ===============================

const SUPABASE_URL = "https://hmwnhwfjffkxmufripok.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_YdLIkiNahtrG0AFSX7iVVA__nYrwICs";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ===============================
// العناصر
// ===============================

const warning = document.getElementById("warning");
const app = document.getElementById("app");

const agreeBtn = document.getElementById("agreeBtn");
const timer = document.getElementById("timer");

const sendOpen = document.getElementById("sendOpen");
const decodeOpen = document.getElementById("decodeOpen");
const ps5Open = document.getElementById("ps5Open");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");

const modalTitle = document.getElementById("modalTitle");

const codeStep = document.getElementById("codeStep");
const codeText = document.getElementById("codeText");
const codeDisplay = document.getElementById("codeDisplay");
const keypad = document.getElementById("keypad");
const clearCode = document.getElementById("clearCode");

const sendStep = document.getElementById("sendStep");
const decodeStep = document.getElementById("decodeStep");
const ps5Step = document.getElementById("ps5Step");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const numberInput = document.getElementById("numberInput");
const decodeBtn = document.getElementById("decodeBtn");
const decodeResult = document.getElementById("decodeResult");

const ps5MessageInput = document.getElementById("ps5MessageInput");
const ps5SendBtn = document.getElementById("ps5SendBtn");

const messagesBox = document.getElementById("messages");
const cooldownText = document.getElementById("cooldown");

// ===============================
// المتغيرات
// ===============================

let currentMode = "";
let enteredCode = "";

let selectedMessage = null;

let cooldownActive = false;

// ===============================
// خريطة الحروف العربية
// ===============================

const arabicMap = {
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

// ===============================
// عكس الخريطة
// ===============================

const reverseMap = {};

for (const letter in arabicMap) {
  reverseMap[arabicMap[letter]] = letter;
}

// ===============================
// تحويل عربي إلى أرقام
// ===============================

function encodeMessage(text) {
  let result = "";

  for (const char of text) {
    if (arabicMap[char]) {
      result += arabicMap[char];
    }
  }

  return result;
}

// ===============================
// تحويل أرقام إلى عربي
// ===============================

function decodeMessage(numbers) {
  numbers = numbers.replace(/\D/g, "");

  let result = "";

  for (let i = 0; i < numbers.length; i += 2) {
    const code = numbers.substring(i, i + 2);

    if (reverseMap[code]) {
      result += reverseMap[code];
    } else {
      result += "؟";
    }
  }

  return result;
}

// ===============================
// العداد 5 ثواني
// ===============================

let timeLeft = 5;

if (timer) {
  timer.textContent = timeLeft;
}

if (agreeBtn) {
  agreeBtn.disabled = true;
}

const countdown = setInterval(function () {

  timeLeft--;

  if (timer) {
    timer.textContent = timeLeft;
  }

  if (timeLeft <= 0) {

    clearInterval(countdown);

    if (timer) {
      timer.textContent = "✓";
    }

    if (agreeBtn) {
      agreeBtn.disabled = false;
    }
  }

}, 1000);

// ===============================
// زر موافق
// ===============================

if (agreeBtn) {

  agreeBtn.addEventListener("click", function () {

    warning.classList.add("hidden");

    app.classList.remove("hidden");

    loadMessages();

    startRealtime();

  });

}

// ===============================
// فتح النافذة
// ===============================

function openModal(title, mode) {

  currentMode = mode;
  enteredCode = "";

  selectedMessage = null;

  modalTitle.textContent = title;

  codeDisplay.textContent = "";

  codeStep.classList.remove("hidden");

  sendStep.classList.add("hidden");
  decodeStep.classList.add("hidden");
  ps5Step.classList.add("hidden");

  modal.classList.remove("hidden");

  codeText.textContent =
    "أدخل رمز الدخول من لوحة الأرقام";

  createKeypad();

}

// ===============================
// إغلاق النافذة
// ===============================

if (closeModal) {

  closeModal.addEventListener("click", function () {

    modal.classList.add("hidden");

    currentMode = "";
    enteredCode = "";
    selectedMessage = null;

  });

}

// ===============================
// أزرار فتح الأنظمة
// ===============================

if (sendOpen) {

  sendOpen.addEventListener("click", function () {

    openModal("إرسال رسالة", "send");

  });

}

if (decodeOpen) {

  decodeOpen.addEventListener("click", function () {

    openModal("فك الشفرة", "decode");

  });

}

if (ps5Open) {

  ps5Open.addEventListener("click", function () {

    openModal("🎮 نظام PS5", "ps5");

  });

}

// ===============================
// لوحة الأرقام
// ===============================

function createKeypad() {

  keypad.innerHTML = "";

  const numbers = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    "0"
  ];

  numbers.forEach(function (number) {

    const button = document.createElement("button");

    button.type = "button";

    button.textContent = number;

    button.addEventListener("click", function () {

      if (enteredCode.length < 8) {

        enteredCode += number;

        codeDisplay.textContent =
          "•".repeat(enteredCode.length);

        checkCode();

      }

    });

    keypad
