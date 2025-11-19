export const Input = ({ type, name, placeholder, id, title, value, onChange }) => {
  const displayTitle = (() => {
    if (title) {
      return title
    } else {
      return name.replace(/_/g, ' ')
    }
  })()

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={id || name}
        className='font-semibold text-sm text-gray-700'
      >
        {displayTitle}
      </label>
      <input
        className="shadow-sm border border-gray-300 rounded-lg p-3 transition-all duration-200 
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                   hover:border-gray-400"
        id={id || name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}