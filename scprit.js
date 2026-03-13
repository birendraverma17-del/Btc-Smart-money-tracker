async function loadPrice(){

let res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
let data = await res.json();

document.getElementById("price").innerHTML =
"BTC Price : $" + data.price;

}

setInterval(loadPrice,3000);
loadPrice();
