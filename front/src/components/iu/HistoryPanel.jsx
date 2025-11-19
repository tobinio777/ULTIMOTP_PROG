export const HistoryPanel = ({ data }) => {
    const sortedData = [...data].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    const recentData = sortedData.slice(0, 5)

    const formatTime = (isoTime) =>
        new Date(isoTime).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })

    return (
        <div className="bg-white shadow-xl p-4 rounded-lg sticky top-24 max-h-[85vh] overflow-y-auto border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Historial de Modificaciones
            </h3>

            {recentData.length === 0 ? (
                <p className="text-gray-600">No hay productos o historial reciente.</p>
            ) : (
                <ul className="space-y-3">
                    {recentData.map((d) => {
                        const isNew = new Date(d.createdAt).getTime() === new Date(d.updatedAt).getTime()
                        const creatorName = d.creator?.fullName || 'N/A'

                        return (
                            <li
                                key={d.id}
                                className={`p-3 rounded-md shadow-sm border ${
                                    isNew
                                        ? 'border-slate-300 bg-slate-50'
                                        : 'border-pink-300 bg-pink-100'
                                }`}
                            >
                                <p className="font-semibold text-gray-900 truncate">{d.name}</p>

                                <p className="text-xs text-gray-700 font-medium mt-1">
                                    {isNew ? 'Nuevo producto creado' : 'Última Modificación'}
                                </p>

                                <p className="text-xs text-gray-600 mt-1">
                                    Por: <span className="font-medium text-slate-900">{creatorName}</span>
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                    Fecha: {formatTime(d.updatedAt)}
                                </p>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
