import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from 'lucide-react'

export function CartItem({ 
  item, 
  onUpdateQuantity, 
  onRemove, 
  size = "default",
  onLinkClick
}) {
  const sizes = {
    small: {
      imageSize: "w-16 h-16",
      titleSize: "text-sm",
      containerPadding: "p-2",
    },
    default: {
      imageSize: "w-24 h-24",
      titleSize: "text-lg",
      containerPadding: "p-4",
    }
  }

  const currentSize = sizes[size] || sizes.default

  return (
    <div className={`flex items-center gap-4 ${currentSize.containerPadding}`}>
      <div className={`relative ${currentSize.imageSize} flex-shrink-0`}>
        <Image
          src={item.images[0].image}
          alt={item.name}
          fill
          className="object-cover rounded-md"
        />
      </div>
      
      <div className="flex-grow">
        <Link 
          href={`/product/${item.id}`} 
          className="hover:text-primary transition-colors"
          onClick={onLinkClick}
        >
          <h3 className={`font-medium ${currentSize.titleSize} mb-1`}>{item.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">${Math.floor(item.price)}</p>
        
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" size="icon" onClick={() => onUpdateQuantity(item.id, -1)}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button variant="outline" size="icon" onClick={() => onUpdateQuantity(item.id, 1)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onRemove(item)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 