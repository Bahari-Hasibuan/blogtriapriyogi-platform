export default function Pricing() {
  return (
    <div className="grid grid-cols-3 gap-6 px-10 py-20">

      <div className="border rounded-2xl p-6">
        <h3>Starter</h3>
        <p>For personal use</p>
        <h2>Rp0</h2>
      </div>

      <div className="border rounded-2xl p-6 bg-black text-white">
        <h3>Pro</h3>
        <p>For creators</p>
        <h2>Rp59K</h2>
      </div>

      <div className="border rounded-2xl p-6">
        <h3>Business</h3>
        <p>For teams</p>
        <h2>Rp149K</h2>
      </div>

    </div>
  )
}
