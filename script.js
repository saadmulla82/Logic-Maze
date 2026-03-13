
var rooms = [
  { name:"Room 1 — Entry Gate", questions:[
    { q:"What does this print?", code:'var x = 10;\nif (x > 5) {\n  console.log("Big");\n} else {\n  console.log("Small");\n}', opts:["Small","Big","Error","Nothing"], ans:"Big", hint:"x=10, 10>5 is true so if block runs." },
    { q:"What is the value of result?", code:'var a = 4;\nvar b = 3;\nvar result = a * b + 2;', opts:["12","14","20","9"], ans:"14", hint:"Multiply first: 4x3=12, then 12+2=14." },
    { q:"How many times does this loop run?", code:'for (var i = 0; i < 5; i++) {\n  console.log(i);\n}', opts:["4","5","6","Infinite"], ans:"5", hint:"i goes 0,1,2,3,4 — that is 5 times." }
  ]},
  { name:"Room 2 — Array Hall", questions:[
    { q:"What value does arr[2] give?", code:'var arr = [10, 20, 30, 40];\nconsole.log(arr[2]);', opts:["10","20","30","40"], ans:"30", hint:"Arrays start at 0. arr[2] is the 3rd item." },
    { q:"What does this function return?", code:'function add(a, b) {\n  return a + b;\n}\nvar result = add(7, 3);', opts:["73","10","7","3"], ans:"10", hint:"add(7,3) means a=7, b=3. 7+3=10." },
    { q:"What is the length?", code:'var fruits = ["apple","banana","mango"];\nconsole.log(fruits.length);', opts:["2","3","4","0"], ans:"3", hint:"3 items in the array. .length gives 3." }
  ]},
  { name:"Room 3 — Final Door", questions:[
    { q:"What is the next number?", code:'// Pattern: 2, 4, 8, 16, ___', opts:["18","24","32","20"], ans:"32", hint:"Each number is x2. So 16x2=32." },
    { q:"What gets printed?", code:'var a = 5, b = 10;\nif (a > 3 && b > 5) {\n  console.log("Pass");\n} else {\n  console.log("Fail");\n}', opts:["Pass","Fail","True","Error"], ans:"Pass", hint:"a>3 is true AND b>5 is true. Both pass." },
    { q:"What is count after the loop?", code:'var count = 0;\nfor (var i = 1; i <= 4; i++) {\n  count = count + i;\n}', opts:["4","10","8","16"], ans:"10", hint:"0+1=1, +2=3, +3=6, +4=10." }
  ]}
];

var score = 0, curroom = 0, curq = 0, hintdone = false, timer;


var prog = 0;
var loading = setInterval(function() {
  prog += 2;
  document.getElementById("bar").style.width = prog + "%";
  if (prog >= 100) {
    clearInterval(loading);
    document.getElementById("loadpage").style.opacity = "0";
    setTimeout(function() {
      document.getElementById("loadpage").style.display = "none";
      document.getElementById("startpage").style.display = "flex";
    }, 500);
  }
}, 40);


var saved = localStorage.getItem("mazescore");
if (saved) document.getElementById("savedscore").textContent = "🏅 Last Score: " + saved + " / 90";


function startGame() {
  score = 0; curroom = 0; curq = 0;
  document.getElementById("scoreval").textContent  = "0";
  document.getElementById("roomsdone").textContent = "0/3";
  document.getElementById("startpage").style.display  = "none";
  document.getElementById("resultpage").style.display = "none";
  document.getElementById("gamepage").style.display   = "block";


  for (var i = 0; i < 3; i++) {
    var r = document.getElementById("room" + i);
    r.className = "room" + (i === 0 ? "" : " locked");
    document.getElementById("icon" + i).textContent = i === 0 ? "⬡" : "🔒";
    r.onclick = null;
  }

  document.getElementById("room0").onclick = function(){ openRoom(0); };
}


function openRoom(idx) {
  curroom = idx; curq = 0;
  document.getElementById("panel").classList.add("open");
  loadQ();
}


function loadQ() {
  hintdone = false;
  var q = rooms[curroom].questions[curq];
  document.getElementById("paneltitle").textContent  = rooms[curroom].name + " (" + (curq+1) + "/3)";
  document.getElementById("qtxt").textContent        = q.q;
  document.getElementById("codebox").textContent     = q.code;
  document.getElementById("hinttext").style.display  = "none";
  document.getElementById("hintbtn").disabled        = false;
  document.getElementById("hintbtn").textContent     = "💡 Hint (-5 pts)";
  document.getElementById("feedback").textContent    = "";
  document.getElementById("feedback").className      = "feedback";

  var grid = document.getElementById("optgrid");
  grid.innerHTML = "";
  for (var i = 0; i < q.opts.length; i++) {
    var btn = document.createElement("button");
    btn.className   = "optbtn";
    btn.textContent = q.opts[i];
    btn.setAttribute("data-val", q.opts[i]);
    btn.onclick     = checkAnswer;
    grid.appendChild(btn);
  }
  startTimer();
}


function startTimer() {
  clearInterval(timer);
  var t = 30;
  document.getElementById("timebar").style.width  = "100%";
  document.getElementById("timerval").textContent = "30";
  document.getElementById("timerval").className   = "val";
  timer = setInterval(function() {
    t--;
    document.getElementById("timerval").textContent = t;
    document.getElementById("timebar").style.width  = (t / 30 * 100) + "%";
    if (t <= 5) document.getElementById("timerval").className = "val danger";
    if (t <= 0) { clearInterval(timer); timeUp(); }
  }, 1000);
}


function checkAnswer() {
  clearInterval(timer);
  var picked = this.getAttribute("data-val");
  var correct = rooms[curroom].questions[curq].ans;
  var btns = document.querySelectorAll(".optbtn");
  for (var i = 0; i < btns.length; i++) btns[i].disabled = true;

  if (picked === correct) {
    this.classList.add("correct");
    score += 10;
    if (score > 90) score = 90;
    document.getElementById("scoreval").textContent = score;
    if (curq === 2) {
      document.getElementById("feedback").textContent = "✓ Room cleared! Door unlocked!";
      document.getElementById("feedback").className   = "feedback ok";
      setTimeout(solveRoom, 1200);
    } else {
      document.getElementById("feedback").textContent = "✓ Correct! Next question...";
      document.getElementById("feedback").className   = "feedback ok";
      setTimeout(function() { curq++; loadQ(); }, 1200);
    }
  } else {
    this.classList.add("wrong");
    for (var j = 0; j < btns.length; j++) {
      if (btns[j].getAttribute("data-val") === correct) btns[j].classList.add("correct");
    }
    document.getElementById("feedback").textContent = "✗ Wrong! Answer: " + correct;
    document.getElementById("feedback").className   = "feedback no";
    setTimeout(closePanel, 1800);
  }
}

function timeUp() {
  var correct = rooms[curroom].questions[curq].ans;
  var btns = document.querySelectorAll(".optbtn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].disabled = true;
    if (btns[i].getAttribute("data-val") === correct) btns[i].classList.add("correct");
  }
  document.getElementById("feedback").textContent = "⏱ Time up! Answer: " + correct;
  document.getElementById("feedback").className   = "feedback no";
  setTimeout(closePanel, 1800);
}


function solveRoom() {
  var r = document.getElementById("room" + curroom);
  r.className = "room done";
  document.getElementById("icon" + curroom).textContent = "✅";
  r.onclick = null;

  var done = curroom + 1;
  document.getElementById("roomsdone").textContent = done + "/3";

  if (done < 3) {
    var next = document.getElementById("room" + done);
    next.className = "room";
    document.getElementById("icon" + done).textContent = "⬡";
    next.onclick = (function(idx){ return function(){ openRoom(idx); }; })(done);
  }

  closePanel();
  if (done === 3) setTimeout(showResult, 600);
}


function closePanel() {
  clearInterval(timer);
  document.getElementById("panel").classList.remove("open");
  document.getElementById("timerval").textContent = "--";
  document.getElementById("timerval").className   = "val";
}


function showHint() {
  if (hintdone) return;
  hintdone = true;
  score = score >= 5 ? score - 5 : 0;
  document.getElementById("scoreval").textContent   = score;
  document.getElementById("hinttext").textContent   = "💡 " + rooms[curroom].questions[curq].hint;
  document.getElementById("hinttext").style.display = "block";
  document.getElementById("hintbtn").disabled       = true;
  document.getElementById("hintbtn").textContent    = "Hint Used";
}


function showResult() {
  document.getElementById("gamepage").style.display   = "none";
  document.getElementById("resultpage").style.display = "flex";
  document.getElementById("finalscore").textContent   = score;
  var icon = "💪", msg = "📚 Keep Practicing!";
  if      (score >= 80) { icon = "🏆"; msg = "🌟 Outstanding! You escaped!"; }
  else if (score >= 50) { icon = "🥇"; msg = "✅ Great job!"; }
  else if (score >= 30) { icon = "🎯"; msg = "👍 Good effort!"; }
  document.getElementById("bigicon").textContent = icon;
  document.getElementById("grade").textContent   = msg;
  localStorage.setItem("mazescore", score);
}


function goHome() {
  document.getElementById("resultpage").style.display = "none";
  document.getElementById("startpage").style.display  = "flex";
  var s = localStorage.getItem("mazescore");
  if (s) document.getElementById("savedscore").textContent = "🏅 Last Score: " + s + " / 90";
}