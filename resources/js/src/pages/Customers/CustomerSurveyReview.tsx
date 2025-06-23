import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import Select from 'react-select';
import Loading from '../Components/Loading';
import axios from 'axios';
import api from '../../utils/axios';

interface Option {
  value: number;
  label: string;
}

interface CustomerSurvey {
  id: number;
  customer_name: string;
  primary_contact: string;
  actual_score: number | null;
  percent_score: number | null;
  total_score: number | null;
  comment: string | null;
  created_at: string;
  status: 'Pending' | 'Ready For Review' | 'Completed';
}

interface CustomerSurveyReviewProps {
  customer_survey: CustomerSurvey;
  onSuccess?: () => void;
}

interface FormValues {
  customer_name : string | null,
  total_score : number | null,
  actual_score : number | null,
  percent_score : number | null
  comment : string | null
}

const CustomerSurveyReview: React.FC<CustomerSurveyReviewProps> = ({ customer_survey, onSuccess }) => {

  // Formik initial values
  const initialValues: FormValues = {
    customer_name: customer_survey?.customer_name,
    total_score: customer_survey?.total_score,
    actual_score:customer_survey?.actual_score,
    percent_score: customer_survey?.percent_score,
    comment: customer_survey?.comment,
  };

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setComment(value);
  };
  

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    // if (!values.customer_survey_template_id || !values.contact_id) {
    //   return;
    // }
    setSubmitting(true);
    try {
      const payload = {
        customer_name: values.customer_name,
        total_score: values.total_score,
        actual_score:values.actual_score,
        percent_score: values.percent_score,
        comment: values.comment,
      };
      const res = await api.post(`/api/customer-surveys/review/${customer_survey.id}`, payload);
      console.log('set',res.status)
      if (res.status != 200) throw new Error('Failed to submit');
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue, errors, touched, isSubmitting }) => (
        <Form className="space-y-6">
          <div>
            <label htmlFor="customerSurveyTemplate" className="block text-sm font-medium">
              Name
            </label>
             <Field
                type="text"
                name="customer_name"
                className="form-input"
                value={values.customer_name}
                readOnly
                />
                {errors.customer_name && touched.customer_name && (
                <div className="text-danger mt-1">{errors.customer_name}</div>
                )}
          </div>
            <div className="flex space-x-4">
                <div>
                    <label htmlFor="customerSurveyTemplate" className="block text-sm font-medium">
                    Total Score
                    </label>
                    <Field
                        type="number"
                        name="total_score"
                        className="form-input"
                        value={values.total_score}
                        />
                        {errors.actual_score && touched.total_score && (
                        <div className="text-danger mt-1">{errors.total_score}</div>
                        )}
                </div>
                <div>
                    <label htmlFor="customerSurveyTemplate" className="block text-sm font-medium">
                    Actual Score
                    </label>
                    <Field
                        type="number"
                        name="actual_score"
                        className="form-input"
                        value={values.actual_score}
                        />
                        {errors.actual_score && touched.actual_score && (
                        <div className="text-danger mt-1">{errors.actual_score}</div>
                        )}
                </div>
                <div>
                    <label htmlFor="customerSurveyTemplate" className="block text-sm font-medium">
                    Percent Score
                    </label>
                    <Field
                        type="number"
                        name="percent_score"
                        className="form-input"
                        value={values.percent_score}
                        />
                        {errors.percent_score && touched.percent_score && (
                        <div className="text-danger mt-1">{errors.percent_score}</div>
                        )}
                </div>
            </div>
          <div>
            <label htmlFor="customerSurveyTemplate" className="block text-sm font-medium">
              Comment
            </label>
             <textarea
                name="comment"
                className="form-input"
                value={values.comment || ''}
                onChange={(e) => {values.comment = e.target.value }}
                />
                {errors.comment && touched.comment && (
                <div className="text-danger mt-1">{errors.comment}</div>
                )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm'}
            </button>
            {(isSubmitting) && <Loading />}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CustomerSurveyReview;
