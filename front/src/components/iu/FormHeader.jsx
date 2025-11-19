import { Link } from 'react-router-dom'

export const FormHeader = ({ title }) => {
    return (
        <>
            <Link
                to="/private"
                className='mb-8 text-white font-semibold hover:text-pink-200 transition-colors underline text-lg'
            >
                ← Volver a Principal
            </Link>

            <h2 className='text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight'>
                {title}
            </h2>
        </>
    )
}
