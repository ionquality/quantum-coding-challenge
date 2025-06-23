import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { 
  FaGraduationCap, 
  FaUser, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaDownload, 
  FaPrint,
  FaStar,
  FaAward
} from 'react-icons/fa';
import api from '../../utils/axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TrainingCertificate {
  id: number;
  user_id: number;
  training_template_id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    employee_id?: string;
  };
  training_template: {
    id: number;
    name: string;
    type: string;
    description: string;
    passing_score: number;
  };
  completed: boolean;
  completed_date: string;
  result: 'passed' | 'failed';
  total_points: number;
  actual_points: number;
  percentage: number;
  status: string;
  assigned_date: string;
  graded_by: number;
  certificate_number?: string;
  certificate_text?: string;
}

interface TrainingCertificateViewProps {
  certificateId?: number;
  userTrainingId?: number;
  onPrint?: () => void;
  onDownload?: () => void;
}

const TrainingCertificateView: React.FC<TrainingCertificateViewProps> = ({
  certificateId,
  userTrainingId,
  onPrint,
  onDownload
}) => {
  const { userTrainingId: routeUserTrainingId } = useParams();
  const dispatch = useDispatch();
  const [certificate, setCertificate] = useState<TrainingCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('Route userTrainingId:', routeUserTrainingId);
  console.log('Prop userTrainingId:', userTrainingId);

  // Use certificateId prop, then userTrainingId prop, then route parameter
  const effectiveId = certificateId || userTrainingId || routeUserTrainingId;

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!effectiveId) {
        setError('No certificate ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/user-trainings/${effectiveId}/certificate`);
        setCertificate(response.data);
        dispatch(setPageTitle(`Training Certificate - ${response.data.user.first_name} ${response.data.user.last_name}`));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [effectiveId, dispatch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateCertificateNumber = () => {
    if (certificate?.certificate_number) {
      return certificate.certificate_number;
    }
    
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `CERT-${year}${month}${day}-${random}`;
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      const content = document.getElementById('certificate-content');
      if (content) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write('<html><head><title>Print Certificate</title>');
          
          const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
          stylesheets.forEach(stylesheet => {
            printWindow.document.write(stylesheet.outerHTML);
          });

          printWindow.document.write('</head><body style="margin:0;">');
          printWindow.document.write(content.outerHTML);
          printWindow.document.write('</body></html>');
          printWindow.document.close();

          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
          }, 500);
        }
      }
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const element = document.getElementById('certificate-content');
      if (element) {
        html2canvas(element, { scale: 2, useCORS: true }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('landscape', 'px', [canvas.width, canvas.height]);
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`training-certificate-${generateCertificateNumber()}.pdf`);
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-[spin_3s_linear_infinite] border-8 border-r-warning border-l-primary border-t-danger border-b-success rounded-full w-14 h-14 inline-block align-middle mb-4"></div>
          <p className="text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Certificate Data</h2>
          <p className="text-gray-600">The certificate information could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 max-w-4xl">
      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-6 print:hidden">
        <button
          onClick={handlePrint}
          className="btn btn-outline-primary flex items-center gap-2"
        >
          <FaPrint className="text-sm" />
          Print Certificate
        </button>
        <button
          onClick={handleDownload}
          className="btn btn-primary flex items-center gap-2"
        >
          <FaDownload className="text-sm" />
          Download
        </button>
      </div>

      {/* Certificate Content */}
      <div
        id="certificate-content"
        className="bg-white relative p-10 font-sans print:shadow-none print:border-0"
     
      >
        <div className="relative text-center z-10 p-8">
            <p className="text-lg text-gray-700 font-sans tracking-widest uppercase">SimpleTrak</p>
            
            <h1 className="text-6xl my-4 text-[#002D62]" style={{ fontFamily: "'UnifrakturCook'", fontWeight: '300' }}>Certificate of Completion</h1>
            
            <p className="text-lg text-gray-500 mt-4">Proudly presented to</p>
            
            <h2 className="text-6xl my-8 text-[#002D62]" style={{fontFamily: "'Great Vibes'", fontWeight: '500'}}>
              {certificate.user.first_name} {certificate.user.last_name}
            </h2>
            
            <div className="text-base text-gray-700 my-8 px-4 sm:px-16 font-serif"
              dangerouslySetInnerHTML={{ __html: certificate.certificate_text || certificate.training_template?.description || 'Certificate of completion for training.' }}
            >
            </div>
            <p className="text-base my-8 text-gray-600 font-serif">{formatDate(certificate.completed_date)}</p>
            
            <div className="flex flex-col sm:flex-row justify-around items-center mt-16 space-y-8 sm:space-y-0">
                <div className="text-center">
                    <div className="border-b-2 border-gray-400 w-48"></div>
                    <p className="mt-2 text-sm text-gray-600">Signature</p>
                </div>
                <div className="bg-gray-200 w-24 h-16 flex items-center justify-center text-gray-500 rounded-md">
                    LOGO
                </div>
                <div className="text-center">
                    <div className="border-b-2 border-gray-400 w-48"></div>
                    <p className="mt-2 text-sm text-gray-600">Signature</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingCertificateView; 