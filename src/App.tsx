import { Search, Star, MapPin } from 'lucide-react';

function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        id="map-container"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/213159/pexels-photo-213159.jpeg?auto=compress&cs=tinysrgb&w=1600")',
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Map API will be integrated here */}
      </div>

      <aside className="absolute top-4 right-4 bottom-4 w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col z-50 md:w-96">
        <div className="sticky top-0 bg-white rounded-t-2xl p-4 border-b border-gray-100 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for places, hotels..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Famous Places</h2>
            <div className="space-y-3">
              <article className="place-card bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="card-image-container h-40 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                    Image Placeholder
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="card-title text-base font-semibold text-gray-900 mb-1">
                    Place Name
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="card-location">Location Address</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="card-rating ml-1 text-sm font-medium text-gray-700">4.5</span>
                    </div>
                    <span className="card-reviews text-xs text-gray-500">(234 reviews)</span>
                  </div>
                </div>
              </article>

              <article className="place-card bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="card-image-container h-40 bg-gradient-to-br from-green-400 to-green-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                    Image Placeholder
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="card-title text-base font-semibold text-gray-900 mb-1">
                    Another Place
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="card-location">Location Address</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="card-rating ml-1 text-sm font-medium text-gray-700">4.8</span>
                    </div>
                    <span className="card-reviews text-xs text-gray-500">(567 reviews)</span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Hotels</h2>
            <div className="space-y-3">
              <article className="hotel-card bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="card-image-container h-40 bg-gradient-to-br from-purple-400 to-purple-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                    Image Placeholder
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="card-title text-base font-semibold text-gray-900 mb-1">
                    Hotel Name
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="card-location">Hotel Address</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center mr-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="card-rating ml-1 text-sm font-medium text-gray-700">4.3</span>
                      </div>
                      <span className="card-reviews text-xs text-gray-500">(189 reviews)</span>
                    </div>
                    <span className="card-price text-sm font-semibold text-blue-600">$120/night</span>
                  </div>
                </div>
              </article>

              <article className="hotel-card bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="card-image-container h-40 bg-gradient-to-br from-orange-400 to-orange-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                    Image Placeholder
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="card-title text-base font-semibold text-gray-900 mb-1">
                    Luxury Hotel
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="card-location">Premium Location</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center mr-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="card-rating ml-1 text-sm font-medium text-gray-700">4.9</span>
                      </div>
                      <span className="card-reviews text-xs text-gray-500">(892 reviews)</span>
                    </div>
                    <span className="card-price text-sm font-semibold text-blue-600">$250/night</span>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

export default App;
