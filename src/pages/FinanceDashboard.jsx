import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  authService, 
  getUsers, 
  getFees, 
  addFee, 
  getSalaries, 
  addSalary, 
  getExpenses, 
  addExpense, 
  getFinanceSummary,
  getSubjects,
  getEnrollments,
  updateEnrollmentStatus,
  addEnrollment,
  getFeeConfigs,
  upsertFeeConfig,
  getStudentBalances
} from '../services/db';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  PieChart, 
  Users, 
  Building, 
  Zap, 
  FileText,
  Loader2,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Settings,
  Scale
} from 'lucide-react';

const FinanceDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Data states
    const [allUsers, setAllUsers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [fees, setFees] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [feeConfigs, setFeeConfigs] = useState([]);
    const [balances, setBalances] = useState([]);
    const [summary, setSummary] = useState({ totalFees: 0, totalSalaries: 0, totalExpenses: 0, balance: 0 });

    // UI state
    const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'fees', 'enrollments', 'config', 'balances', 'salaries', 'expenses'
    const [showAddModal, setShowAddModal] = useState(null); // 'fee', 'salary', 'expense', 'enrollment', 'config'
    const [feeSearchQuery, setFeeSearchQuery] = useState('');
    const [selectedStudentForFee, setSelectedStudentForFee] = useState(null);

    // Form states
    const [feeForm, setFeeForm] = useState({ student_id: '', subject_id: '', amount: '', month_for: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }), frequency: 'monthly' });
    const [salaryForm, setSalaryForm] = useState({ teacher_id: '', amount: '', month_for: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }) });
    const [expenseForm, setExpenseForm] = useState({ category: 'Building', amount: '', description: '' });
    const [enrollmentForm, setEnrollmentForm] = useState({ student_id: '', subject_id: '', payment_frequency: 'monthly' });
    const [configForm, setConfigForm] = useState({ subject_id: '', grade: '', monthly_fee: '', weekly_fee: '' });

    useEffect(() => {
        const u = authService.getCurrentUser();
        if (!u || u.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        setUser(u);
        loadData();
    }, [navigate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, subjectsData, enrollmentsData, feesData, salariesData, expensesData, summaryData, configsData, balancesData] = await Promise.all([
                getUsers(),
                getSubjects(),
                getEnrollments(),
                getFees(),
                getSalaries(),
                getExpenses(),
                getFinanceSummary(),
                getFeeConfigs(),
                getStudentBalances()
            ]);
            setAllUsers(usersData);
            setSubjects(subjectsData);
            setEnrollments(enrollmentsData);
            setFees(feesData);
            setSalaries(salariesData);
            setExpenses(expensesData);
            setSummary(summaryData);
            setFeeConfigs(configsData);
            setBalances(balancesData);
        } catch (err) {
            setError('Failed to load financial data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const students = allUsers.filter(u => u.role === 'student');
    const teachers = allUsers.filter(u => u.role === 'teacher');

    const handleAddFee = async (e) => {
        e.preventDefault();
        if (!feeForm.student_id || !feeForm.amount || !feeForm.subject_id) return;
        setSubmitting(true);
        const res = await addFee(feeForm);
        if (res) {
            setSuccess('Fee recorded successfully! Subject access automatically enabled/updated.');
            setShowAddModal(null);
            setFeeForm({ student_id: '', subject_id: '', amount: '', month_for: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }) });
            loadData();
        } else {
            setError('Failed to record fee.');
        }
        setSubmitting(false);
    };

    const handleAddEnrollment = async (e) => {
        e.preventDefault();
        if (!enrollmentForm.student_id || !enrollmentForm.subject_id) return;
        setSubmitting(true);
        const res = await addEnrollment(enrollmentForm);
        if (res) {
            setSuccess('Student enrolled successfully!');
            setShowAddModal(null);
            setEnrollmentForm({ student_id: '', subject_id: '', payment_frequency: 'monthly' });
            loadData();
        } else {
            setError('Failed to enroll student. They might already be enrolled in this subject.');
        }
        setSubmitting(false);
    };

    const toggleEnrollmentStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const res = await updateEnrollmentStatus(id, newStatus);
        loadData();
    };

    const handleAddConfig = async (e) => {
        e.preventDefault();
        if (!configForm.subject_id || !configForm.grade || !configForm.monthly_fee) return;
        setSubmitting(true);
        try {
            await upsertFeeConfig(configForm);
            setSuccess('Fee configuration updated!');
            setShowAddModal(null);
            setConfigForm({ subject_id: '', grade: '', monthly_fee: '', weekly_fee: '' });
            loadData();
        } catch (err) {
            setError('Failed to update configuration.');
        }
        setSubmitting(false);
    };

    const handleAddSalary = async (e) => {
        e.preventDefault();
        if (!salaryForm.teacher_id || !salaryForm.amount) return;
        setSubmitting(true);
        const res = await addSalary(salaryForm);
        if (res) {
            setSuccess('Salary payment recorded successfully!');
            setShowAddModal(null);
            setSalaryForm({ teacher_id: '', amount: '', month_for: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }) });
            loadData();
        } else {
            setError('Failed to record salary.');
        }
        setSubmitting(false);
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!expenseForm.amount) return;
        setSubmitting(true);
        const res = await addExpense(expenseForm);
        if (res) {
            setSuccess('Expense recorded successfully!');
            setShowAddModal(null);
            setExpenseForm({ category: 'Building', amount: '', description: '' });
            loadData();
        } else {
            setError('Failed to record expense.');
        }
        setSubmitting(false);
    };

    if (!user || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 size={40} className="animate-spin text-purple-600" />
            </div>
        );
    }

    const studentEnrollments = enrollments.filter(e => e.student_id === Number(feeForm.student_id));

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-12">
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="p-3 bg-white rounded-full shadow-sm hover:shadow text-slate-500 hover:text-slate-800 transition">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <Wallet className="text-emerald-500" size={32} /> Finance Manager
                            </h1>
                            <p className="text-slate-500 mt-1">Manage student fees, access control, and class expenses.</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => setShowAddModal('config')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-bold border border-slate-200">
                            <Settings size={18} /> Configure Fees
                        </button>
                        <button onClick={() => setShowAddModal('enrollment')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-100">
                            <Plus size={18} /> New Enrollment
                        </button>
                        <button onClick={() => setShowAddModal('fee')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg shadow-emerald-100">
                            <Plus size={18} /> Record Fee
                        </button>
                    </div>
                </div>

                {/* Alerts */}
                {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2">
                    <AlertCircle size={20} /> {error}
                </div>}
                {success && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={20} /> {success}
                </div>}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 font-medium text-sm">Total Fees</span>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ArrowUpRight size={20} /></div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Rs. {summary.totalFees.toLocaleString()}</h3>
                        <p className="text-xs text-slate-400 mt-1">Total income collected</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 font-medium text-sm">Salaries Paid</span>
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ArrowDownRight size={20} /></div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Rs. {summary.totalSalaries.toLocaleString()}</h3>
                        <p className="text-xs text-slate-400 mt-1">Payments to teachers</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 font-medium text-sm">General Costs</span>
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ArrowDownRight size={20} /></div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Rs. {summary.totalExpenses.toLocaleString()}</h3>
                        <p className="text-xs text-slate-400 mt-1">Maintenance, utility, etc.</p>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-sm border ${summary.balance >= 0 ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm">Net Balance</span>
                            <PieChart size={20} />
                        </div>
                        <h3 className="text-2xl font-bold">Rs. {summary.balance.toLocaleString()}</h3>
                        <p className="text-xs opacity-80 mt-1">Current profit/loss</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    <button onClick={() => setActiveTab('summary')} className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${activeTab === 'summary' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>Summary</button>
                    <button onClick={() => setActiveTab('balances')} className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${activeTab === 'balances' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>Balances</button>
                    <button onClick={() => setActiveTab('enrollments')} className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${activeTab === 'enrollments' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>Access Control</button>
                    <button onClick={() => setActiveTab('fees')} className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${activeTab === 'fees' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>Student Fees</button>
                    <button onClick={() => setActiveTab('config')} className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${activeTab === 'config' ? 'bg-slate-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>Fee Config</button>
                    <button onClick={() => setActiveTab('salaries')} className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${activeTab === 'salaries' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>Salaries</button>
                    <button onClick={() => setActiveTab('expenses')} className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${activeTab === 'expenses' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>Other Expenses</button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    {activeTab === 'summary' && (
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><History size={24} className="text-slate-400" /> Recent Activity</h2>
                            <div className="space-y-4">
                                {[...fees, ...salaries, ...expenses]
                                    .sort((a,b) => new Date(b.payment_date || b.expense_date) - new Date(a.payment_date || a.expense_date))
                                    .slice(0, 10)
                                    .map((t, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-full ${t.student_id ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    {t.student_id ? <Users size={20} /> : t.teacher_id ? <Users size={20} /> : t.category === 'Zap' ? <Zap size={20} /> : <Building size={20} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">
                                                        {t.student_id ? `Fee from ${t.lms_users?.name}` : t.teacher_id ? `Salary to ${t.lms_users?.name}` : t.category}
                                                    </h4>
                                                    <p className="text-sm text-slate-500">
                                                        {t.payment_date || t.expense_date} • {t.month_for || t.description}
                                                        {t.lms_subjects && ` • Subject: ${t.lms_subjects.name}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-lg font-bold ${t.student_id ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.student_id ? '+' : '-'} Rs. {Number(t.amount).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'balances' && (
                        <div className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Student</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Subject</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Paid</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Standard Fee</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {balances.map((b, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800">{b.student?.fullname}</div>
                                                    <div className="text-xs text-slate-400 font-mono">Grade {b.student?.grade}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-800 font-medium">{b.subject?.name}</td>
                                                <td className="px-6 py-4 text-emerald-600 font-bold">Rs. {b.totalPaid.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    Rs. {b.standardFee ? b.standardFee.toLocaleString() : 'N/A'} <span className="text-[10px] uppercase font-bold text-slate-400">({b.payment_frequency})</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${b.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'config' && (
                        <div className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Subject</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Grade</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Monthly Fee</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Weekly Fee</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {subjects?.length > 0 ? subjects.map(sub => [1,2,3,4,5,6,7,8,9,10,11].map(grade => {
                                            const config = feeConfigs.find(c => c.subject_id === sub.id && c.grade === grade);
                                            return (
                                                <tr key={`${sub.id}-${grade}`} className="hover:bg-slate-50 transition">
                                                    <td className="px-6 py-4 text-slate-800 font-medium">{sub.name}</td>
                                                    <td className="px-6 py-4 text-slate-600 font-bold text-xs">GR {grade}</td>
                                                    <td className="px-6 py-4 text-emerald-600 font-bold">Rs. {config?.monthly_fee?.toLocaleString() || '0'}</td>
                                                    <td className="px-6 py-4 text-blue-600 font-bold">Rs. {config?.weekly_fee?.toLocaleString() || '0'}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => {
                                                                setConfigForm({
                                                                    subject_id: sub.id,
                                                                    grade: grade,
                                                                    monthly_fee: config?.monthly_fee || '',
                                                                    weekly_fee: config?.weekly_fee || ''
                                                                });
                                                                setShowAddModal('config');
                                                            }}
                                                            className="text-indigo-600 hover:text-indigo-800 font-bold text-sm"
                                                        >
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                                    <p className="mb-4">No subjects found in the system.</p>
                                                    <Link to="/curriculum" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm">
                                                        Add Subjects First
                                                    </Link>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'enrollments' && (
                        <div className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Student</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Subject</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Plan</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Status</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Due Date</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {enrollments.map((en, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800">{en.lms_users?.fullname}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{en.lms_users?.student_code}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-800 font-medium">{en.lms_subjects?.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${en.payment_frequency === 'weekly' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                        {en.payment_frequency}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1.5 font-bold text-sm ${en.status === 'active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {en.status === 'active' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                                                        {en.status === 'active' ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-sm flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {en.next_due_date || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => toggleEnrollmentStatus(en.id, en.status)}
                                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${en.status === 'active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                                    >
                                                        {en.status === 'active' ? 'Disable Access' : 'Enable Access'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'fees' && (
                        <div className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Student</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Subject</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Month</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Date</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600 font-bold">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {fees.map((f, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 font-bold text-slate-800">{f.lms_users?.fullname}</td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">{f.lms_subjects?.name || 'General'}</td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">{f.month_for}</td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">{f.payment_date}</td>
                                                <td className="px-6 py-4 text-emerald-600 font-bold">Rs. {Number(f.amount).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'salaries' && (
                        <div className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Teacher</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Month</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Date</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {salaries.map((s, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 font-bold text-slate-800">{s.lms_users?.fullname}</td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">{s.month_for}</td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">{s.payment_date}</td>
                                                <td className="px-6 py-4 text-rose-600 font-bold">Rs. {Number(s.amount).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'expenses' && (
                        <div className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Category</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Description</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Date</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {expenses.map((e, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 font-bold text-slate-800">
                                                    <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs">{e.category}</span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">{e.description}</td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">{e.expense_date}</td>
                                                <td className="px-6 py-4 text-rose-600 font-bold">Rs. {Number(e.amount).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddModal === 'enrollment' && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                        <button onClick={() => setShowAddModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                            <Plus size={24} className="rotate-45" />
                        </button>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                             <Users className="text-indigo-500" /> New Enrollment
                        </h2>
                        <form onSubmit={handleAddEnrollment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Student</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={enrollmentForm.student_id}
                                    onChange={e => setEnrollmentForm({...enrollmentForm, student_id: e.target.value})}
                                    required
                                >
                                    <option value="">Select Student</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.fullname} ({s.student_code})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={enrollmentForm.subject_id}
                                    onChange={e => setEnrollmentForm({...enrollmentForm, subject_id: e.target.value})}
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} (Grade {s.grade})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Payment Frequency</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={enrollmentForm.payment_frequency}
                                    onChange={e => setEnrollmentForm({...enrollmentForm, payment_frequency: e.target.value})}
                                    required
                                >
                                    <option value="monthly">Monthly Payment</option>
                                    <option value="weekly">Weekly Payment</option>
                                </select>
                            </div>
                            <button type="submit" disabled={submitting} className="w-full py-4 rounded-xl text-white font-bold bg-indigo-600 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                                {submitting ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                                Enroll Student
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showAddModal === 'fee' && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                        <button onClick={() => { setShowAddModal(null); setSelectedStudentForFee(null); setFeeSearchQuery(''); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                            <Plus size={24} className="rotate-45" />
                        </button>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ArrowUpRight className="text-emerald-500" /> Record Student Fee
                        </h2>
                        <form onSubmit={handleAddFee} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Search Student</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text"
                                        placeholder="Type student name or code..."
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={feeSearchQuery}
                                        onChange={e => {
                                            setFeeSearchQuery(e.target.value);
                                            if (selectedStudentForFee) setSelectedStudentForFee(null);
                                        }}
                                    />
                                </div>
                                
                                {feeSearchQuery && !selectedStudentForFee && (
                                    <div className="mt-2 max-h-40 overflow-y-auto border border-slate-100 rounded-xl shadow-inner divide-y divide-slate-50">
                                        {students.filter(s => 
                                            s.fullname?.toLowerCase().includes(feeSearchQuery.toLowerCase()) || 
                                            s.student_code?.toLowerCase().includes(feeSearchQuery.toLowerCase())
                                        ).map(s => (
                                            <button 
                                                key={s.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedStudentForFee(s);
                                                    setFeeSearchQuery(s.fullname);
                                                    setFeeForm({...feeForm, student_id: s.id, subject_id: ''});
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition text-sm font-medium text-slate-700"
                                            >
                                                {s.fullname} <span className="text-slate-400 text-xs ml-2">Grade {s.grade}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedStudentForFee && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                                            <select 
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                                value={feeForm.subject_id}
                                                onChange={e => {
                                                    const subId = e.target.value;
                                                    const config = feeConfigs.find(c => c.subject_id === Number(subId) && c.grade === selectedStudentForFee.grade);
                                                    const amount = feeForm.frequency === 'weekly' ? config?.weekly_fee : config?.monthly_fee;
                                                    setFeeForm({...feeForm, subject_id: subId, amount: amount || ''});
                                                }}
                                                required
                                            >
                                                <option value="">Select Subject</option>
                                                {(() => {
                                                    // Merge subjects from enrollments and assigned_subjects in user record
                                                    const enrolledIds = enrollments.filter(e => e.student_id === selectedStudentForFee.id).map(e => Number(e.subject_id));
                                                    const assignedIds = selectedStudentForFee.assigned_subjects?.map(as => Number(as.subject_id)) || [];
                                                    const uniqueIds = Array.from(new Set([...enrolledIds, ...assignedIds]));
                                                    
                                                    if (uniqueIds.length > 0) {
                                                        return uniqueIds.map(subId => {
                                                            const subject = subjects.find(s => s.id === subId);
                                                            return <option key={subId} value={subId}>{subject?.name || `Subject ${subId}`}</option>;
                                                        });
                                                    } else {
                                                        return subjects.map(sub => (
                                                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                                                        ));
                                                    }
                                                })()}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Frequency</label>
                                            <select 
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                                value={feeForm.frequency}
                                                onChange={e => {
                                                    const freq = e.target.value;
                                                    const config = feeConfigs.find(c => c.subject_id === Number(feeForm.subject_id) && c.grade === selectedStudentForFee.grade);
                                                    const amount = freq === 'weekly' ? config?.weekly_fee : config?.monthly_fee;
                                                    setFeeForm({...feeForm, frequency: freq, amount: amount || ''});
                                                }}
                                                required
                                            >
                                                <option value="monthly">Monthly</option>
                                                <option value="weekly">Weekly</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Month/Detail</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500 outline-none"
                                            value={feeForm.month_for}
                                            onChange={e => setFeeForm({...feeForm, month_for: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Amount (Rs.)</label>
                                        <input 
                                            type="number" 
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500 outline-none font-bold"
                                            value={feeForm.amount}
                                            onChange={e => setFeeForm({...feeForm, amount: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <button type="submit" disabled={submitting} className="w-full py-4 rounded-xl text-white font-bold bg-emerald-600 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                                        {submitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                                        Record Fee & Enable Access
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {showAddModal === 'config' && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                        <button onClick={() => setShowAddModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                            <Plus size={24} className="rotate-45" />
                        </button>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                             <Settings className="text-slate-500" /> Fee Configuration
                        </h2>
                        <form onSubmit={handleAddConfig} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={configForm.subject_id}
                                    onChange={e => setConfigForm({...configForm, subject_id: e.target.value})}
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Grade</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={configForm.grade}
                                    onChange={e => setConfigForm({...configForm, grade: e.target.value})}
                                    required
                                >
                                    <option value="">Select Grade</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(g => <option key={g} value={g}>Grade {g} Students Only</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Monthly Fee</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                                        value={configForm.monthly_fee}
                                        onChange={e => setConfigForm({...configForm, monthly_fee: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Weekly Fee</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                        value={configForm.weekly_fee}
                                        onChange={e => setConfigForm({...configForm, weekly_fee: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={submitting} className="w-full py-4 rounded-xl text-white font-bold bg-slate-800 hover:bg-slate-900 transition flex items-center justify-center gap-2">
                                {submitting ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                                Save Configuration
                            </button>
                        </form>
                    </div>
                </div>
            )}
            
            {showAddModal === 'salary' && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                        <button onClick={() => setShowAddModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                            <Plus size={24} className="rotate-45" />
                        </button>

                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ArrowDownRight className="text-rose-500" /> Record Teacher Salary
                        </h2>

                        <form onSubmit={handleAddSalary} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Teacher</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
                                    value={salaryForm.teacher_id}
                                    onChange={e => setSalaryForm({...salaryForm, teacher_id: e.target.value})}
                                    required
                                >
                                    <option value="">Select Teacher</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Month For</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. March 2026"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500 outline-none"
                                    value={salaryForm.month_for}
                                    onChange={e => setSalaryForm({...salaryForm, month_for: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Amount (Rs.)</label>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500 outline-none font-bold"
                                    value={salaryForm.amount}
                                    onChange={e => setSalaryForm({...salaryForm, amount: e.target.value})}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-4 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 bg-rose-600 shadow-rose-100 hover:bg-rose-700`}
                            >
                                {submitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                                {submitting ? 'Processing...' : 'Record Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showAddModal === 'expense' && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                        <button onClick={() => setShowAddModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                            <Plus size={24} className="rotate-45" />
                        </button>

                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ArrowDownRight className="text-rose-500" /> Record Expense
                        </h2>

                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
                                    value={expenseForm.category}
                                    onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                                    required
                                >
                                    <option value="Building">Building (Rent/Cost)</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Equipment">Equipment</option>
                                    <option value="Salaries">Worker Salaries</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Electricity bill for March"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500 outline-none"
                                    value={expenseForm.description}
                                    onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Amount (Rs.)</label>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500 outline-none font-bold"
                                    value={expenseForm.amount}
                                    onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-4 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 bg-rose-600 shadow-rose-100 hover:bg-rose-700`}
                            >
                                {submitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                                {submitting ? 'Processing...' : 'Record Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceDashboard;
