import { Card } from "@/components/ui/card"

interface TVChannelCardProps {
  title: string
  imageUrl: string
  onClick: () => void
}

const gradients = [
    // Combinaisons lumineuses et dynamiques
    'bg-gradient-to-r from-red-700 via-orange-600 to-yellow-500',      // Chaud et énergique
    'bg-gradient-to-r from-blue-700 via-cyan-500 to-teal-400',         // Dynamique et moderne
    'bg-gradient-to-r from-purple-700 via-pink-600 to-rose-500',       // Tendance et accrocheur
    'bg-gradient-to-r from-green-700 via-lime-600 to-yellow-500',      // Naturel et lumineux
    'bg-gradient-to-r from-indigo-700 via-violet-600 to-purple-500',   // Élégant avec une touche vibrante
    
    // Variantes contrastées mais vives
    'bg-gradient-to-r from-cyan-700 via-teal-600 to-green-500',        // Rafraîchissant et affirmé
    'bg-gradient-to-r from-orange-700 via-yellow-600 to-red-500',      // Chaleureux et accueillant
    'bg-gradient-to-r from-pink-700 via-rose-600 to-orange-500',       // Joyeux et éclatant
    
    // Variantes multicolores inspirantes
    'bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500',       // Sophistiqué et vibrant
    'bg-gradient-to-r from-teal-700 via-indigo-600 to-purple-500',     // Tendance et captivant
    
    // Combinaisons classiques mais revitalisées
    'bg-gradient-to-r from-gray-700 via-slate-600 to-blue-500',        // Moderne avec une touche vive
    'bg-gradient-to-r from-black via-gray-700 to-indigo-600',          // Sobre avec une pointe de couleur
  ];
  

export function TVChannelCard({ title, imageUrl, onClick }: TVChannelCardProps) {
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)]

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-shadow overflow-hidden ${randomGradient}`}
      onClick={onClick}
    >
      <div className="aspect-video relative">
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <img
            src={imageUrl}
            alt={title}
            className="object-contain w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}

