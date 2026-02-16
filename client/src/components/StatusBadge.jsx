const StatusBadge = ({ status }) => {
  const styles = {
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-yellow-100 text-yellow-700',
    'half-day': 'bg-orange-100 text-orange-700',
    'not-checked-in': 'bg-gray-100 text-gray-600',
    weekend: 'bg-gray-100 text-gray-400'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || styles['absent']}`}>
      {status === 'not-checked-in' ? 'Not Checked In' : status}
    </span>
  );
};

export default StatusBadge;
