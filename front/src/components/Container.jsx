export const Container = ({ children }) => {
  return (
    <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100 min-h-[70vh]">
      {children}
    </div>
  )
}