export default function StatsCard() {
  return (
    <div className="grid grid-cols-3 gap-4 p-6">

      <div className="p-4 border rounded-xl">
        <div className="text-sm text-gray-500">Total Posts</div>
        <div className="text-2xl font-bold">24</div>
      </div>

      <div className="p-4 border rounded-xl">
        <div className="text-sm text-gray-500">Views</div>
        <div className="text-2xl font-bold">12.8K</div>
      </div>

      <div className="p-4 border rounded-xl">
        <div className="text-sm text-gray-500">Revenue</div>
        <div className="text-2xl font-bold">$128</div>
      </div>

    </div>
  )
}
