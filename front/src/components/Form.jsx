export const Form = ({ children, title, Legend, onSubmit }) => {
  return (
    <div className="w-full max-w-md md:max-w-lg bg-white rounded-2xl shadow-xl p-6 md:p-10">
      <h2 className="font-bold text-3xl text-gray-800 text-center mb-8">{title}</h2>
      
      <form className="flex flex-col gap-5" onSubmit={onSubmit}>
        {children}
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        <Legend />
      </div>
    </div>
  )
}