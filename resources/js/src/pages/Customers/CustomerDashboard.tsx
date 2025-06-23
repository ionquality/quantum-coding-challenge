import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import {
  FaExclamationTriangle,
  FaExclamationCircle,
  FaCheckCircle,
  FaThumbsUp,
  FaInfoCircle,
  FaTimesCircle,
  FaCalendarAlt
} from 'react-icons/fa';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css'; // or any Flatpickr theme you prefer
import Dropdown from '../../components/Dropdown';
import CountUp from 'react-countup';
import { bool } from 'yup';

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
  const isDark = useSelector(
    (state: IRootState) =>
      state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode
  );


  interface ProcessOwner {
    id: string;
    first_name: string;
    last_name: string;
  }


  const [metrics, setMetrics] = useState<{
    totalItems: number;
    totalPossiblePoints: number;
    totalActualPoints: number;
    onTimePercentage: number;
    passPercentage: number;
    riskIndex: number;
    riskLevel: string;
    processOwner: ProcessOwner; 
    highRisk: any[];
    riskColor:string;
    lowRisk: any[];
    mediumRisk: any[];
    objectiveRisk: any[];
    chartData: {
      months: any[];
      labels: string[] | null;
      values: any[] | null;
    };
  }>({
    totalItems: 0,
    totalPossiblePoints: 0,
    totalActualPoints: 0,
    onTimePercentage: 0,
    passPercentage: 0,
    riskIndex: 0,
    riskColor: '#9e9e9e',
    riskLevel: '',
    processOwner: {} as ProcessOwner,
    highRisk: [],
    lowRisk: [],
    mediumRisk: [],
    objectiveRisk: [],
    chartData: {
      months: [],
      labels: null,
      values: null
    }
  });

  
  const [isLoading,setIsLoading] = useState<boolean>(true)

  // Set default date range: from one year ago to today
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 1);
    return [start, end];
  });

  const currentRisk = [metrics.riskIndex];

  // RadialBar Chart configuration for "Current Risk"

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const start_date = dateRange[0].toISOString().split('T')[0];
        const end_date = dateRange[1].toISOString().split('T')[0];
  
        const queryParams = new URLSearchParams({ start_date, end_date }).toString();
  
        const response = await fetch(`/api/customer-dashboard-metrics?${queryParams}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
  
        const data = await response.json();

        const chartLabels = Object.keys(data.data.chartData); 
        const chartValues = Object.values(data.data.chartData); 

        setMetrics({
          totalItems: data.data.totalItems,
          totalPossiblePoints: data.data.totalPossiblePoints,
          totalActualPoints: data.data.totalActualPoints,
          onTimePercentage: data.data.onTimePercentage,
          passPercentage: data.data.passPercentage,
          riskIndex: data.data.risk,
          processOwner: data.data.processOwner,
          riskLevel: data.data.riskLevel,
          riskColor: data.data.riskColor,
          highRisk: data.data.highRisk,
          mediumRisk: data.data.mediumRisk,
          lowRisk: data.data.lowRisk,
          objectiveRisk: data.data.objectiveRisk,
          chartData: {
            months: data.data.chartData,
            labels: chartLabels,
            values: chartValues
          }
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching customer metrics:', error);
      }
    };
  
    fetchMetrics();
  }, [dateRange]);  


   const uniqueVisitorSeries: any = {
    series: [
      {
        name: 'Surveys',
        data: metrics.chartData?.values || []
      }
    ],
    options: {
      chart: {
        height: 360,
        type: 'bar',
        fontFamily: 'Nunito, sans-serif',
        toolbar: { show: false }
      },
      dataLabels: { enabled: false },
      stroke: { width: 2, colors: ['transparent'] },
      colors: ['#5c1ac3'],
      dropShadow: {
        enabled: true,
        blur: 3,
        color: '#515365',
        opacity: 0.4
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 8,
          borderRadiusApplication: 'end'
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '14px',
        itemMargin: { horizontal: 8, vertical: 8 }
      },
      grid: {
        borderColor: isDark ? '#191e3a' : '#e0e6ed',
        padding: { left: 20, right: 20 },
        xaxis: { lines: { show: false } }
      },
      xaxis: {
        categories: metrics.chartData?.labels || [],
        axisBorder: {
          show: true,
          color: isDark ? '#3b3f5c' : '#e0e6ed'
        }
      },
      yaxis: {
        tickAmount: 6,
        opposite: isRtl,
        labels: { offsetX: isRtl ? -10 : 0 }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: isDark ? 'dark' : 'light',
          type: 'vertical',
          shadeIntensity: 0.3,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100]
        }
      },
      tooltip: { marker: { show: true } }
    }
  };
  
  // Helper to format date range as string
  const formatDateRange = (range: Date[]) => {
    if (range && range.length === 2) {
      return `${range[0].toLocaleDateString()} - ${range[1].toLocaleDateString()}`;
    }
    return '';
  };



  const chartOptions: ApexOptions = {
    chart: {
      type: 'radialBar',
      sparkline: { enabled: false },
    },
    colors: [metrics.riskColor], // <-- Add this line for the actual bar color
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        dataLabels: {
          name: { show: true, fontSize: '16px', offsetY: -10 },
          value: {
            show: true,
            fontSize: '22px',
            formatter: (val: number) => `${val}%`
          }
        }
      }
    },
    labels: ['Current Risk']
  };

  // Bar chart configuration (omitted for brevity)
  

  return (
    <div>
      {/* Header Row with Dashboard Title and Date Range Filter */}
      <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5 justify-between">
        <h5 className="font-semibold text-lg dark:text-white-light">
          Customer Dashboard
        </h5>
        {/* Flatpickr wrapper using "wrap" */}
        <div className="relative inline-block">
          <Flatpickr
            options={{
              mode: 'range',
              dateFormat: 'Y-m-d',
              position: isRtl ? 'auto right' : 'auto left',
              wrap: true
            }}
            value={dateRange}
            onChange={(selectedDates) => setDateRange(selectedDates)}
          >
            <button type="button" data-input className="flex items-center px-4 py-2 border border-gray-300 rounded cursor-pointer">
              <FaCalendarAlt className="text-xl mr-2" />
              <span className="font-semibold">Date Range:</span>
              <span className="ml-2">{formatDateRange(dateRange)}</span>
            </button>
          </Flatpickr>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 text-white">
        {/* TOTAL ITEMS */}
        <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
          <div className="flex justify-between">
            <div className="ltr:mr-1 rtl:ml-1 text-xl font-semibold">Total Items</div>
          </div>
          <div className="flex items-center mt-5">

            <div className="text-4xl font-bold ltr:mr-3 rtl:ml-3">
              <CountUp start={0} end={metrics.totalItems} duration={5}></CountUp>
            </div>
          </div>
        </div>
        {/* ON TIME */}
        <div className="panel bg-gradient-to-r from-violet-500 to-violet-400">
          <div className="flex justify-between">
            <div className="ltr:mr-1 rtl:ml-1 text-xl font-semibold">Total Points</div>
          </div>
          <div className="flex items-center mt-5">
            <div className="text-4xl font-bold ltr:mr-3 rtl:ml-3">
              <CountUp start={0} end={metrics.totalActualPoints} duration={5}></CountUp>
              </div>
          </div>
        </div>
        {/* PASS PERCENTAGE */}
        <div className="panel bg-gradient-to-r from-blue-500 to-blue-400">
          <div className="flex justify-between">
            <div className="ltr:mr-1 rtl:ml-1 text-xl font-semibold">Points Possible</div>
          </div>
          <div className="flex items-center mt-5">
            <div className="text-4xl font-bold ltr:mr-3 rtl:ml-3">
              <CountUp start={0} end={metrics.totalPossiblePoints} duration={5}></CountUp>
              </div>
          </div>
        </div>
        {/* RISK INDEX */}
        <div className="panel bg-gradient-to-r from-fuchsia-500 to-fuchsia-400">
          <div className="flex justify-between">
            <div className="ltr:mr-1 rtl:ml-1 text-xl font-semibold">Risk Index</div>
          </div>
          <div className="flex items-center mt-5">
            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">
              <CountUp start={0} end={metrics.riskIndex} duration={5}></CountUp>
              %</div>
          </div>
        </div>
      </div>

      {/* Risk Model and Current Risk Chart */}
      <div className="grid grid-cols-12 gap-6">
        {/* Risk Model Panel */}
        <div className="col-span-6 panel h-full">
          <div className="flex items-center justify-between dark:text-white-light mb-5">
            <h5 className="font-semibold text-lg">Risk Model</h5>
            {/* Info icon with tooltip */}
            <div className="relative group ml-2">
              <FaInfoCircle className="text-xl cursor-pointer" />
              <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                On time percentage is calculated from completed calibration events.<br />
                Pass percentage is calculated from total calibration records.<br />
                Both factors are weighted per importance to the process.<br />
                Risk criteria scale is determined by management; if combined percentage is rated in
                the Low or Medium risk levels, then process is marked Effective and a Green check
                mark is displayed. If Combined percentage is rated High risk then process is marked
                Not-Effective and a Red “X” is displayed.
              </div>
            </div>
          </div>
          {/* debug metrics */}
          <div className="space-y-9">
            {/* High Risk */}
            <div className="flex items-center">
              <div className="w-9 h-9 ltr:mr-3 rtl:ml-3">
                <div className="bg-danger-light dark:bg-danger text-danger dark:text-danger-light rounded-full w-9 h-9 grid place-content-center">
                  <FaExclamationTriangle size={20} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex font-semibold text-white-dark mb-2">
                  <h6>High Risk</h6>
                  <p className="ltr:ml-auto rtl:mr-auto">{metrics.highRisk?.[0]}% - {metrics.highRisk?.[1]}%</p>
                </div>
                <div className="rounded-full h-2 bg-dark-light dark:bg-[#1b2e4b] shadow">
                  <div className="bg-gradient-to-r from-red-300 to-red-500 w-11/12 h-full rounded-full" style={{ width: (metrics.highRisk?.[1] || 0) + '%' }}></div>
                </div>
              </div>
            </div>

            {/* Medium Risk */}
            <div className="flex items-center">
              <div className="w-9 h-9 ltr:mr-3 rtl:ml-3">
                <div className="bg-warning-light dark:bg-warning text-warning dark:text-warning-light rounded-full w-9 h-9 grid place-content-center">
                  <FaExclamationCircle size={20} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex font-semibold text-white-dark mb-2">
                  <h6>Medium Risk</h6>
                  <p className="ltr:ml-auto rtl:mr-auto">{metrics.mediumRisk?.[0]}% - {metrics.mediumRisk?.[1]}%</p>
                </div>
                <div className="w-full rounded-full h-2 bg-dark-light dark:bg-[#1b2e4b] shadow">
                  <div className="bg-gradient-to-r from-yellow-200 to-yellow-500 w-full h-full rounded-full" style={{ width: (metrics.mediumRisk?.[1] || 0) + '%' }}></div>
                </div>
              </div>
            </div>

            {/* Low Risk */}
            <div className="flex items-center">
              <div className="w-9 h-9 ltr:mr-3 rtl:ml-3">
                <div className="bg-success-light dark:bg-success text-success dark:text-success-light rounded-full w-9 h-9 grid place-content-center">
                  <FaCheckCircle size={20} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex font-semibold text-white-dark mb-2">
                  <h6>Low Risk</h6>
                  <p className="ltr:ml-auto rtl:mr-auto">{metrics.lowRisk?.[0]}% - {metrics.lowRisk?.[1]}%</p>
                </div>
                <div className="w-full rounded-full h-2 bg-dark-light dark:bg-[#1b2e4b] shadow">
                  <div className="bg-gradient-to-r from-green-300 to-green-500 w-full h-full rounded-full"  style={{ width: (metrics.lowRisk?.[1] || 0) + '%' }}></div>
                </div>
              </div>
            </div>

            {/* Objective Risk */}
            <div className="flex items-center">
              <div className="w-9 h-9 ltr:mr-3 rtl:ml-3">
                <div className="bg-info-light dark:bg-info text-info dark:text-info-light rounded-full w-9 h-9 grid place-content-center">
                  <FaThumbsUp size={20} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex font-semibold text-white-dark mb-2">
                  <h6>Objective</h6>
                  <p className="ltr:ml-auto rtl:mr-auto">{metrics.objectiveRisk?.[0]}% - {metrics.objectiveRisk?.[1]}%</p>
                </div>
                <div className="w-full rounded-full h-2 bg-dark-light dark:bg-[#1b2e4b] shadow">
                  <div className="bg-gradient-to-r from-cyan-200 to-cyan-500 w-full h-full rounded-full" style={{ width: (metrics.objectiveRisk?.[1] || 0) + '%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Risk RadialBar Chart Panel */}
        <div className="col-span-6 panel h-full flex flex-col relative">
          {/* Panel Header with inline red "X" next to text */}
          <div className="flex items-center dark:text-white-light mb-5">
          <h5
            className="font-semibold text-lg flex items-center"
            style={{ color: metrics.riskColor }}
          >
            {metrics.riskLevel} Risk
            {/* - Not Effective
            <FaTimesCircle className="text-red-600 text-2xl ml-2" /> */}
          </h5>

          </div>
          <div className="flex-1 flex items-center justify-center">
            {!isLoading && 
              <Chart options={chartOptions} series={currentRisk} type="radialBar" height={300} />
            }          </div>
        </div>
      </div>

      {/* Process Owner and Bar Chart */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Process Owner Column */}
        <div className="col-span-4 h-full">
          <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative">
            <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative">
              <div
                className="bg-white/40 rounded-t-md bg-center bg-cover p-6 pb-0"
                style={{
                  backgroundImage: `url('/assets/images/notification-bg.png')`,
                  backgroundRepeat: 'no-repeat',
                  width: '100%',
                  height: '100%'
                }}
              >
                <img
                  className="object-contain w-4/5 max-h-40 mx-auto"
                  src={`/assets/images/profile-35.png`}
                  alt="contact_image"
                />
              </div>
              <div className="px-6 pb-6 mt-4">
                <div className="text-xl">Process Owner</div>
                <div className="text-white-dark">{metrics.processOwner.first_name} {metrics.processOwner.last_name}</div>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  View Training Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-8 h-full">
          <div className="panel h-full p-0">
            <div className="flex items-start justify-between dark:text-white-light mb-5 p-5 border-b border-white-light dark:border-[#1b2e4b]">
              <h5 className="font-semibold text-lg">Surveys Per Month</h5>
            </div>
            <div className="overflow-x-auto">
              <ReactApexChart
                options={uniqueVisitorSeries.options}
                series={uniqueVisitorSeries.series}
                type="bar"
                height={360}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
