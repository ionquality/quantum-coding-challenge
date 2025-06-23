import React from 'react';
import { useField, FieldProps, FieldHelperProps } from 'formik';
import Select from 'react-select';

interface CustomFieldProps extends FieldProps {
  label?: string;
  placeholder?: string;
}

// Text input component
export const TextInput: React.FC<CustomFieldProps> = ({
                                                        field,
                                                        label,
                                                        placeholder,
                                                        ...props
                                                      }) => {
  // Remove extra Formik props
  const { form, meta, ...inputProps } = props;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={field.name} className="block mb-1 font-bold">
          {label}
        </label>
      )}
      <input
        type="text"
        {...field}
        placeholder={placeholder}
        {...inputProps}
        className="p-2 border border-gray-300 rounded-md w-full"
      />
    </div>
  );
};

// Checkbox input component
export const CheckboxInput: React.FC<CustomFieldProps> = ({
                                                            field,
                                                            label,
                                                            ...props
                                                          }) => {
  const { form, meta, ...inputProps } = props;
  return (
    <div className="mb-4 flex items-center">
      <input
        type="checkbox"
        {...field}
        {...inputProps}
        className="mr-2"
        checked={!!field.value}
      />
      {label && (
        <label htmlFor={field.name} className="font-bold">
          {label}
        </label>
      )}
    </div>
  );
};

// Date input component
export const DateInput: React.FC<CustomFieldProps> = ({
                                                        field,
                                                        label,
                                                        placeholder,
                                                        ...props
                                                      }) => {
  const { form, meta, ...inputProps } = props;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={field.name} className="block mb-1 font-bold">
          {label}
        </label>
      )}
      <input
        type="date"
        {...field}
        placeholder={placeholder}
        {...inputProps}
        className="p-2 border border-gray-300 rounded-md w-full"
      />
    </div>
  );
};

// Email input component
export const EmailInput: React.FC<CustomFieldProps> = ({
                                                         field,
                                                         label,
                                                         placeholder,
                                                         ...props
                                                       }) => {
  const { form, meta, ...inputProps } = props;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={field.name} className="block mb-1 font-bold">
          {label}
        </label>
      )}
      <input
        type="email"
        {...field}
        placeholder={placeholder}
        {...inputProps}
        className="p-2 border border-gray-300 rounded-md w-full"
      />
    </div>
  );
};

// Number input component
export const NumberInput: React.FC<CustomFieldProps> = ({
                                                          field,
                                                          label,
                                                          placeholder,
                                                          ...props
                                                        }) => {
  const { form, meta, ...inputProps } = props;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={field.name} className="block mb-1 font-bold">
          {label}
        </label>
      )}
      <input
        type="number"
        {...field}
        placeholder={placeholder}
        {...inputProps}
        className="p-2 border border-gray-300 rounded-md w-full"
      />
    </div>
  );
};

// Textarea input component
export const TextareaInput: React.FC<CustomFieldProps> = ({
                                                            field,
                                                            label,
                                                            placeholder,
                                                            ...props
                                                          }) => {
  const { form, meta, ...inputProps } = props;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={field.name} className="block mb-1 font-bold">
          {label}
        </label>
      )}
      <textarea
        {...field}
        placeholder={placeholder}
        {...inputProps}
        className="p-2 border border-gray-300 rounded-md w-full"
      />
    </div>
  );
};

// URL input component
export const URLInput: React.FC<CustomFieldProps> = ({
                                                       field,
                                                       label,
                                                       placeholder,
                                                       ...props
                                                     }) => {
  const { form, meta, ...inputProps } = props;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={field.name} className="block mb-1 font-bold">
          {label}
        </label>
      )}
      <input
        type="url"
        {...field}
        placeholder={placeholder}
        {...inputProps}
        className="p-2 border border-gray-300 rounded-md w-full"
      />
    </div>
  );
};

// Range slider component
export const RangeInput: React.FC<CustomFieldProps> = ({
                                                         field,
                                                         label,
                                                         ...props
                                                       }) => {
  const { form, meta, ...inputProps } = props;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={field.name} className="block mb-1 font-bold">
          {label}
        </label>
      )}
      <input type="range" {...field} {...inputProps} className="w-full" />
    </div>
  );
};

// Yes/No Switch component
export const YesNoField: React.FC<CustomFieldProps> = ({
  field,
  label,
  ...props
}) => {
  const { form, meta, ...inputProps } = props;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={field.name} className="block mb-1 font-bold">
          {label}
        </label>
      )}
      <div className="flex items-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={field.value === 'yes'}
            onChange={(e) => {
              field.onChange({
                target: {
                  name: field.name,
                  value: e.target.checked ? 'yes' : 'no'
                }
              });
            }}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            {field.value === 'yes' ? 'Yes' : 'No'}
          </span>
        </label>
      </div>
      {meta.touched && meta.error && (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// Native HTML Select Input Component
// ----------------------------------------------------------------------
interface NativeSelectInputProps extends FieldProps {
  label?: string;
  options: { value: string | number; label: string }[];
}

export const SelectInput: React.FC<NativeSelectInputProps> = ({
                                                                field,
                                                                label,
                                                                options,
                                                                ...props
                                                              }) => {
  const { form, meta, ...inputProps } = props;
  // Ensure value is primitive
  const value =
    typeof field.value === 'object' && field.value !== null ? '' : field.value;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={field.name} className="block mb-1 font-bold">
          {label}
        </label>
      )}
      <select
        {...field}
        {...inputProps}
        value={value}
        className="p-2 border border-gray-300 rounded-md w-full"
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// ----------------------------------------------------------------------
// React‑Select Input Component (Searchable Dropdown)
// ----------------------------------------------------------------------
interface ReactSelectInputProps {
  name: string;
  label?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export const ReactSelectInput: React.FC<
  ReactSelectInputProps & Partial<FieldProps>
> = (props) => {
  const { name, label, options, placeholder, field, meta, form } = props;
  // Use field.name if provided; otherwise, use the provided name.
  const finalName = (field && field.name) || name;

  let localField: FieldProps['field'],
    localMeta: FieldProps['meta'],
    localHelpers: FieldHelperProps<any>;

  if (field && meta && form) {
    // When used via <Field component={ReactSelectInput} ... />
    localField = field;
    localMeta = meta;
    localHelpers = {
      setValue: (value: any) => form.setFieldValue(finalName, value),
      setTouched: (touched: boolean) => form.setFieldTouched(finalName, touched),
      setError: (error: any) => form.setFieldError(finalName, error),
    };
  } else {
    // Standalone usage: use the useField hook.
    const [f, m, h] = useField<any>(finalName);
    localField = f;
    localMeta = m;
    localHelpers = h;
  }

  // Ensure the field's value is a primitive.
  const currentValue =
    typeof localField.value === 'object' && localField.value !== null
      ? ''
      : localField.value;
  const selectedOption =
    options.find((option) => option.value === currentValue) || null;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={finalName} className="block mb-1 font-bold">
          {label}
        </label>
      )}
      <Select
        id={finalName}
        name={finalName}
        options={options}
        value={selectedOption}
        onChange={(option) =>
          localHelpers.setValue(option ? option.value : '')
        }
        onBlur={() => localHelpers.setTouched(true)}
        placeholder={placeholder}
      />
      {localMeta && localMeta.touched && localMeta.error && (
        <div className="text-red-500 text-sm">
          {typeof localMeta.error === 'object'
            ? JSON.stringify(localMeta.error)
            : localMeta.error}
        </div>
      )}
    </div>
  );
};

