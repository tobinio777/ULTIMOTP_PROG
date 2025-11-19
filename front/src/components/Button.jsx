export const Button = ({
  type = 'submit',
  value,
  onClick = undefined,
  disabled = false 
}) => {
  return (
    <button
      className='w-full py-3 px-6 rounded-lg shadow-lg font-semibold text-base text-white 
                 bg-linear-to-r from-slate-700 to-slate-900 
                 hover:from-slate-800 hover:to-slate-950 
                 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] 
                 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 
                 disabled:opacity-50 disabled:cursor-not-allowed'
      type={type} 
      onClick={onClick} 
      disabled={disabled} 
    >
      {value}
    </button>
  )
}