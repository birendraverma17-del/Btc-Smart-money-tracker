import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function BTCSmartMoneyDashboard() {
  const [price, setPrice] = useState(null);
  const [funding, setFunding] = useState(null);
  const [oi, setOi] = useState(null);
  const [ratio, setRatio] = useState(null);
  const [bias, setBias] = useState("NEUTRAL");
  const [chart, setChart] = useState([]);
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [liqs, setLiqs] = useState([]);

  async function fetchData() {
    try {
      const priceRes = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
      const priceData = await priceRes.json();
      const p = parseFloat(priceData.price);
      setPrice(p);

      const fundingRes = await fetch("https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT");
      const fundingData = await fundingRes.json();
      const f = parseFloat(fundingData.lastFundingRate);
      setFunding(f);

      const oiRes = await fetch("https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT");
      const oiData = await oiRes.json();
      const openInterest = parseFloat(oiData.openInterest);
      setOi(openInterest);

      const ratioRes = await fetch(
        "https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=1"
      );
      const ratioData = await ratioRes.json();
      const r = ratioData?.length ? parseFloat(ratioData[0].longShortRatio) : null;
      setRatio(r);

      const depthRes = await fetch("https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=10");
      const depth = await depthRes.json();
      setBids(depth.bids || []);
      setAsks(depth.asks || []);

      const liqRes = await fetch(
        "https://fapi.binance.com/fapi/v1/forceOrders?symbol=BTCUSDT&limit=10"
      );
      const liqData = await liqRes.json();
      setLiqs(Array.isArray(liqData) ? liqData : []);

      const now = new Date().toLocaleTimeString();
      setChart((prev) => [...prev.slice(-25), { time: now, price: p }]);

      if (f < 0 && r !== null && r < 1) setBias("LONG");
      else if (f > 0 && r !== null && r > 1) setBias("SHORT");
      else setBias("NEUTRAL");
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 grid gap-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold">
        BTC Smart Money PRO
      </motion.h1>

      <div className="grid md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p>BTC Price</p><h2 className="text-2xl font-bold">{price ? `$${price}` : "Loading"}</h2></CardContent></Card>
        <Card><CardContent className="p-4"><p>Funding Rate</p><h2>{funding ?? "Loading"}</h2></CardContent></Card>
        <Card><CardContent className="p-4"><p>Open Interest</p><h2>{oi ?? "Loading"}</h2></CardContent></Card>
        <Card><CardContent className="p-4"><p>Long/Short Ratio</p><h2>{ratio ?? "Loading"}</h2></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4">BTC Micro Price Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <iframe
            title="tradingview"
            src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=BINANCE:BTCUSDT&interval=5&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=000000&studies=[]&theme=dark"
            style={{ width: "100%", height: "500px", border: "none" }}
          />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4">Whale Order Book</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-bold mb-2">Top Bids</h3>
                {bids.slice(0,5).map((b,i)=> (
                  <p key={i}>${parseFloat(b[0]).toFixed(0)} | {parseFloat(b[1]).toFixed(2)}</p>
                ))}
              </div>
              <div>
                <h3 className="font-bold mb-2">Top Asks</h3>
                {asks.slice(0,5).map((a,i)=> (
                  <p key={i}>${parseFloat(a[0]).toFixed(0)} | {parseFloat(a[1]).toFixed(2)}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4">Recent Liquidations</h2>
            {liqs.slice(0,6).map((l,i)=> (
              <p key={i} className="text-sm">
                {l.side} | ${parseFloat(l.price).toFixed(0)} | {parseFloat(l.origQty).toFixed(3)} BTC
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl">AI Market Bias</h2>
            <p className="text-sm">Funding + Trader Ratio Logic</p>
          </div>
          <Button className="text-lg px-6">{bias}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
