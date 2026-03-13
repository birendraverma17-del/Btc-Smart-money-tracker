// script.js (debug version)
const out = (text) => {
  let log = document.getElementById("debug");
  if(!log){
    log = document.createElement("pre");
    log.id = "debug";
    log.style.color = "yellow";
    log.style.textAlign = "left";
    log.style.padding = "12px";
    log.style.margin = "12px";
    log.style.background = "#111";
    log.style.borderRadius = "8px";
    document.body.appendChild(log);
  }
  log.innerText = log.innerText + "\\n" + text;
};

async function loadPriceDirect(){
  try{
    out("Trying direct Binance fetch...");
    const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
    out("HTTP status: " + res.status);
    const data = await res.json();
    out("Response JSON: " + JSON.stringify(data));
    document.getElementById("price").innerText = "BTC Price : $" + data.price;
  }catch(err){
    out("Direct fetch error: " + err.message);
    document.getElementById("price").innerText = "Error loading price — check debug below";
  }
}

loadPriceDirect();
setInterval(loadPriceDirect, 5000);
