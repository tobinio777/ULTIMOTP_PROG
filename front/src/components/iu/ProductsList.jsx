import { ProductRow } from '../ProductRow'

export const ProductsList = ({ data, onDelete }) => {
    return (
        <div className="flex flex-col gap-4">
            {data.map((d) => <ProductRow key={d.id} data={d} onDelete={onDelete} />)}
        </div>
    )
}
