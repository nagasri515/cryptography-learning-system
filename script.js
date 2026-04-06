function showSection(id) {
document.querySelectorAll(".section").forEach(s => s.style.display="none");
document.getElementById(id).style.display="block";
}

function caesarEncrypt(t,k){
return t.replace(/[A-Z]/gi,c=>String.fromCharCode((c.charCodeAt(0)-65+k)%26+65));
}
function caesarDecrypt(t,k){return caesarEncrypt(t,26-k);}

let map="QWERTYUIOPASDFGHJKLZXCVBNM";
function substitutionEncrypt(t){
return t.toUpperCase().replace(/[A-Z]/g,c=>map[c.charCodeAt(0)-65]);
}
function substitutionDecrypt(t){
return t.toUpperCase().replace(/[A-Z]/g,c=>String.fromCharCode(map.indexOf(c)+65));
}

async function aesEncrypt(text,key){
let enc=new TextEncoder();
let cryptoKey=await crypto.subtle.importKey("raw",enc.encode(key.padEnd(16,"0")),"AES-GCM",false,["encrypt"]);
let iv=crypto.getRandomValues(new Uint8Array(12));
let encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv},cryptoKey,enc.encode(text));
return btoa(String.fromCharCode(...iv))+":"+btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

function desEncrypt(t,k){
return btoa([...t].map((c,i)=>String.fromCharCode(c.charCodeAt(0)^k.charCodeAt(i%k.length))).join(""));
}
function desDecrypt(c,k){
let t=atob(c);
return [...t].map((c,i)=>String.fromCharCode(c.charCodeAt(0)^k.charCodeAt(i%k.length))).join("");
}

function hillEncrypt(t){
t=t.toUpperCase().replace(/[^A-Z]/g,"");
if(t.length%2)t+="X";
let r="";
for(let i=0;i<t.length;i+=2){
let a=t.charCodeAt(i)-65,b=t.charCodeAt(i+1)-65;
r+=String.fromCharCode((3*a+3*b)%26+65);
r+=String.fromCharCode((2*a+5*b)%26+65);
}
return r;
}

function diffieHellman(){
let p=23,g=5,a=6,b=15;
let A=(g**a)%p,B=(g**b)%p;
return "Shared Key: "+((B**a)%p);
}

function blowfishEncrypt(t,k){
return btoa([...t].map((c,i)=>String.fromCharCode((c.charCodeAt(0)^k.charCodeAt(i%k.length))+(i%5))).join(""));
}
function blowfishDecrypt(c,k){
let t=atob(c);
return [...t].map((c,i)=>String.fromCharCode((c.charCodeAt(0)-(i%5))^k.charCodeAt(i%k.length))).join("");
}

async function encrypt(){
let a=algo.value,t=text.value,k=key.value,r="";
if(a==="caesar") r=caesarEncrypt(t.toUpperCase(),+k);
else if(a==="substitution") r=substitutionEncrypt(t);
else if(a==="aes") r=await aesEncrypt(t,k);
else if(a==="des") r=desEncrypt(t,k);
else if(a==="hill") r=hillEncrypt(t);
else if(a==="diffie") r=diffieHellman();
else if(a==="blowfish") r=blowfishEncrypt(t,k);
result.innerText=r;
saveHistory(a,t,r);
}

async function decrypt(){
let a=algo.value,t=text.value,k=key.value,r="";
if(a==="caesar") r=caesarDecrypt(t.toUpperCase(),+k);
else if(a==="substitution") r=substitutionDecrypt(t);
else if(a==="des") r=desDecrypt(t,k);
else if(a==="blowfish") r=blowfishDecrypt(t,k);
else r="Not available";
result.innerText=r;
}

function toggleDarkMode(){document.body.classList.toggle("dark");}

function downloadResult(){
let blob=new Blob([result.innerText]);
let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="result.txt";
a.click();
}

function encryptFile(){
let f=fileInput.files[0],r=new FileReader();
r.onload=()=>fileResult.innerText=btoa(r.result);
r.readAsText(f);
}

async function saveHistory(algo,input,output){
await fetch("http://localhost:3000/save",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({algorithm:algo,input,output})
});
}

async function loadHistory(){
let res=await fetch("http://localhost:3000/history");
let data=await res.json();
let table=document.querySelector("#historyTable tbody");
table.innerHTML="";
data.forEach(item=>{
table.innerHTML+=`<tr>
<td>${item.id}</td>
<td>${item.algorithm}</td>
<td>${item.input}</td>
<td>${item.output}</td>
<td>${item.time}</td>
</tr>`;
});
}

async function clearHistory(){
await fetch("http://localhost:3000/history",{method:"DELETE"});
alert("Cleared");
loadHistory();
}

async function downloadHistory(){
let res=await fetch("http://localhost:3000/history");
let data=await res.json();
let blob=new Blob([JSON.stringify(data,null,2)]);
let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="history.json";
a.click();
}