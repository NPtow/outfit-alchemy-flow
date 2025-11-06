import { OutfitCollage, CollageItem } from "@/components/OutfitCollage";
import { getOutfitLayout, getCategoryPosition } from "@/lib/outfitLayouts";
import { useState } from "react";

// Тестовые образы с локальными изображениями
const testOutfits = [
  {
    id: "test-outfit-1",
    name: "Деловой образ",
    items: [
      { id: "1", name: "Черный пиджак", category: "пиджак", image: "/clothing-images/blazer-black.png" },
      { id: "2", name: "Кремовый топ", category: "топ", image: "/clothing-images/top-cream.png" },
      { id: "3", name: "Черные брюки", category: "брюки", image: "/clothing-images/pants-black.png" },
      { id: "4", name: "Черные туфли", category: "туфли", image: "/clothing-images/heels-black.png" },
      { id: "5", name: "Черная сумка", category: "сумка", image: "/clothing-images/bag-black.png" },
    ]
  },
  {
    id: "test-outfit-2",
    name: "Повседневный стиль",
    items: [
      { id: "6", name: "Белая футболка", category: "футболка", image: "/clothing-images/tshirt-white.png" },
      { id: "7", name: "Коричневые брюки", category: "брюки", image: "/clothing-images/pants-brown.png" },
      { id: "8", name: "Бежевые лоферы", category: "обувь", image: "/clothing-images/loafers-beige.png" },
      { id: "9", name: "Серебристая сумка", category: "сумка", image: "/clothing-images/bag-silver.png" },
    ]
  },
  {
    id: "test-outfit-3",
    name: "Укороченные брюки",
    items: [
      { id: "10", name: "Кремовый топ", category: "топ", image: "/clothing-images/top-cream.png" },
      { id: "11", name: "Укороченные брюки", category: "брюки", image: "/clothing-images/pants-brown-cropped.png" },
      { id: "12", name: "Черная сумка", category: "сумка", image: "/clothing-images/bag-black.png" },
      { id: "13", name: "Черные туфли", category: "туфли", image: "/clothing-images/heels-black.png" },
    ]
  }
];

export default function LayoutTest() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [metrics, setMetrics] = useState<{
    organicScore: number;
    overlapScore: number;
    spaceUtilization: number;
  } | null>(null);

  const currentOutfit = testOutfits[currentIndex];
  
  // Получаем layout для текущего образа
  const layout = getOutfitLayout(currentOutfit.items);
  
  // Преобразуем items в формат CollageItem
  const collageItems: CollageItem[] = currentOutfit.items.map(item => {
    const position = getCategoryPosition(item.category, layout);
    return {
      id: item.id,
      name: item.name,
      brand: "Test Brand",
      category: item.category,
      itemNumber: item.id,
      price: 0,
      shopUrl: "#",
      image: item.image,
      position: position || { left: 0, top: 0, right: 0.5, bottom: 0.5, zIndex: 1 }
    };
  });

  // Вычисляем метрики
  const calculateMetrics = () => {
    // 1. Органичность (насколько разнообразны размеры)
    const sizes = collageItems.map(item => {
      const width = item.position.right - item.position.left;
      const height = item.position.bottom - item.position.top;
      return width * height;
    });
    const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const sizeVariance = sizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / sizes.length;
    const organicScore = Math.min(100, sizeVariance * 1000); // Чем больше разброс, тем органичнее

    // 2. Оценка перекрытий (сколько вещей реально перекрываются)
    let overlapCount = 0;
    for (let i = 0; i < collageItems.length; i++) {
      for (let j = i + 1; j < collageItems.length; j++) {
        const item1 = collageItems[i].position;
        const item2 = collageItems[j].position;
        
        // Проверяем пересечение прямоугольников
        if (!(item1.right <= item2.left || item1.left >= item2.right || 
              item1.bottom <= item2.top || item1.top >= item2.bottom)) {
          overlapCount++;
        }
      }
    }
    const maxPossibleOverlaps = (collageItems.length * (collageItems.length - 1)) / 2;
    const overlapScore = (overlapCount / maxPossibleOverlaps) * 100;

    // 3. Использование пространства (покрытие canvas)
    const totalArea = sizes.reduce((a, b) => a + b, 0);
    const spaceUtilization = totalArea * 100;

    setMetrics({
      organicScore: Math.round(organicScore),
      overlapScore: Math.round(overlapScore),
      spaceUtilization: Math.round(spaceUtilization)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">🎨 Layout Test Drive</h1>
        <p className="text-gray-400 text-center mb-8">Тестирование системы органичного расположения вещей</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Превью образа */}
          <div className="space-y-4">
            <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{currentOutfit.name}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + testOutfits.length) % testOutfits.length)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % testOutfits.length)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                <OutfitCollage items={collageItems} outfitId={currentOutfit.id} />
              </div>

              <button
                onClick={calculateMetrics}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-[#C8E871] to-[#A8D861] text-black font-semibold rounded-lg hover:opacity-90 transition"
              >
                📊 Вычислить метрики
              </button>
            </div>

            {/* Список вещей */}
            <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Вещи в образе ({collageItems.length})</h3>
              <div className="space-y-2">
                {collageItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-lg">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-white rounded" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.category}</div>
                    </div>
                    <div className="text-xs text-gray-500">z: {item.position.zIndex}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Метрики */}
          <div className="space-y-4">
            {metrics ? (
              <>
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur rounded-2xl p-6 border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl">
                      🎨
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Органичность</h3>
                      <p className="text-sm text-gray-400">Разнообразие размеров</p>
                    </div>
                  </div>
                  <div className="text-5xl font-bold mb-2">{metrics.organicScore}<span className="text-2xl text-gray-400">/100</span></div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, metrics.organicScore)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-3">
                    {metrics.organicScore >= 70 ? "✅ Отлично! Размеры разнообразны" : 
                     metrics.organicScore >= 40 ? "⚠️ Средне. Можно добавить больше разнообразия" :
                     "❌ Слабо. Вещи слишком одинаковые"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur rounded-2xl p-6 border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-2xl">
                      🔄
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Перекрытие</h3>
                      <p className="text-sm text-gray-400">Глубина композиции</p>
                    </div>
                  </div>
                  <div className="text-5xl font-bold mb-2">{metrics.overlapScore}<span className="text-2xl text-gray-400">/100</span></div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${metrics.overlapScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-3">
                    {metrics.overlapScore >= 30 ? "✅ Хорошо! Вещи создают глубину" : 
                     metrics.overlapScore >= 15 ? "⚠️ Средне. Можно добавить перекрытий" :
                     "❌ Мало перекрытий. Образ плоский"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur rounded-2xl p-6 border border-green-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl">
                      📐
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Заполненность</h3>
                      <p className="text-sm text-gray-400">Использование пространства</p>
                    </div>
                  </div>
                  <div className="text-5xl font-bold mb-2">{metrics.spaceUtilization}<span className="text-2xl text-gray-400">/100</span></div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${metrics.spaceUtilization}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-3">
                    {metrics.spaceUtilization >= 60 ? "✅ Отлично! Пространство заполнено" : 
                     metrics.spaceUtilization >= 40 ? "⚠️ Средне. Можно увеличить размеры" :
                     "❌ Слабо. Много пустого места"}
                  </p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">📝 Общая оценка</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Средний балл:</span>
                      <span className="font-semibold text-[#C8E871]">
                        {Math.round((metrics.organicScore + metrics.overlapScore + metrics.spaceUtilization) / 3)}/100
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-700">
                      <p className="text-gray-300">
                        {((metrics.organicScore + metrics.overlapScore + metrics.spaceUtilization) / 3) >= 60 
                          ? "🎉 Отличный результат! Layout работает как в Aesty" 
                          : "🔧 Нужны улучшения в расположении вещей"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-12 border border-gray-700 text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-400 mb-4">Нажмите кнопку "Вычислить метрики"</p>
                <p className="text-sm text-gray-500">Система проанализирует расположение вещей</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
