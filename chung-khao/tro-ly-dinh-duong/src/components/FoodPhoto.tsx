import { useState } from 'react';
import { Utensils } from 'lucide-react';
import { foodImages } from '../data/foodImages';
export function FoodPhoto({ id, name }: { id: string; name: string }) {
 const [failedSource, setFailedSource] = useState('');
 const source = foodImages[id];
 return <div className="food-photo">{source && failedSource !== source.src ? <img src={source.src} alt={`Ảnh minh họa ${name}`} width="640" height="480" loading="lazy" decoding="async" onError={() => setFailedSource(source.src)}/> : <div className="food-photo-fallback"><Utensils size={24}/><span>{name}</span></div>}</div>;
}
