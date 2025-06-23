import React from 'react';
import { Field } from 'formik';
import {
  TextInput,
  CheckboxInput,
  DateInput,
  EmailInput,
  NumberInput,
  TextareaInput,
  URLInput,
  RangeInput,
  SelectInput,
  ReactSelectInput,
  YesNoField,
} from './CustomFieldComponents';
import { useSelectOptions } from '../hooks/useSelecOptions';

interface Question {
  id: number;
  non_conformance_section_id: number;
  non_conformance_input_id: number;
  sequence: number;
  name: string;
  alpha_name: string;
  input_type: string;
  model_name: string | null;
  answer: any;
}

interface DynamicFieldProps {
  question: Question;
  fieldName?: string; // ✅ Optional custom field name for Formik
}

const DynamicField: React.FC<DynamicFieldProps> = ({ question, fieldName }) => {
  // ✅ Use the custom fieldName if provided, fallback to question.id
  const name = fieldName || question.id.toString();

  if (question.input_type === 'select') {
    const { options, loading, error } = useSelectOptions(question.model_name);
    if (loading) return <div>Loading options for {question.name}...</div>;
    if (error) return <div>Error loading options for {question.name}: {error}</div>;
    return (
      <Field
        name={name}
        component={ReactSelectInput}
        label={question.name}
        options={options.map((opt) => ({
          value: opt.name,
          label: opt.name,
        }))}
      />
    );
  }

  switch (question.input_type) {
    case 'text':
      return (
        <Field
          name={name}
          component={TextInput}
          label={question.name}
          placeholder={question.name}
        />
      );
    case 'yes_no':
      return (
        <Field
          name={name}
          component={YesNoField}
          label={question.name}
        />
      );
    case 'checkbox':
      return (
        <Field
          name={name}
          component={CheckboxInput}
          label={question.name}
        />
      );
    case 'date':
      return (
        <Field
          name={name}
          component={DateInput}
          label={question.name}
        />
      );
    case 'email':
      return (
        <Field
          name={name}
          component={EmailInput}
          label={question.name}
          placeholder={question.name}
        />
      );
    case 'number':
      return (
        <Field
          name={name}
          component={NumberInput}
          label={question.name}
          placeholder={question.name}
        />
      );
    case 'textarea':
      return (
        <Field
          name={name}
          component={TextareaInput}
          label={question.name}
          placeholder={question.name}
        />
      );
    case 'url':
      return (
        <Field
          name={name}
          component={URLInput}
          label={question.name}
          placeholder={question.name}
        />
      );
    case 'range':
      return (
        <Field
          name={name}
          component={RangeInput}
          label={question.name}
        />
      );
    default:
      return (
        <Field
          name={name}
          component={TextInput}
          label={question.name}
          placeholder={question.name}
        />
      );
  }
};

export default DynamicField;
