import { Input } from '../Input'

export const FormInputWithError = ({ type, name, placeholder, value, title, onChange, error, step, min }) => {
    return (
        <div className='relative'>
            <Input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                title={title}
                onChange={onChange}
                step={step}
                min={min}
            />
            {error && <p className="text-red-500 text-xs mt-1 absolute -bottom-4 font-medium">{error}</p>}
        </div>
    )
}
