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
  getFinanceSummary 
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
  AlertCircle
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
    const [fees, setFees] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState({ totalFees: 0, totalSalaries: 0, totalExpenses: 0, balance: 0 });

    // UI state
    const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'fees', 'salaries', 'expenses'
    const [showAddModal, setShowAddModal] = useState(null); // 'fee', 'salary', 'expense'

    // Form states
    const [feeForm, setFeeForm] = useState({ student_id: '', amount: '', month_for: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }) });
    const [salaryForm, setSalaryForm] = useState({ teacher_id: '', amount: '', month_for: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }) });
    const [expenseForm, setExpenseForm] = useState({ category: 'Building', amount: '', description: '' });

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
            const [usersData, feesData, salariesData, expensesData, summaryData] = await Promise.all([
                getUsers(),
                getFees(),
                getSalaries(),
                getExpenses(),
                getFinanceSummary()
            ]);
            setAllUsers(usersData);
            setFees(feesData);
            setSalaries(salariesData);
            setExpenses(expensesData);
            setSummary(summaryData);
        } catch (err) {
            setError('Failed to load financial data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFee = async (e) => {
        e.preventDefault();
        if (!feeForm.student_id || !feeForm.amount) return;
        setSubmitting(true);
        const res = await addFee(feeForm);
        if (res) {
            setSuccess('Fee recorded successfully!');
            setShowAddModal(null);
            setFeeForm({ student_id: '', amount: '', month_for: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }) });
            loadData();
        } else {
            setError('Failed to record fee.');
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

    const students = allUsers.filter(u => u.role === 'student');
    const teachers = allUsers.filter(u => u.role === 'teacher');

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
                            <p className="text-slate-500 mt-1">Track student fees, teacher salaries, and class expenses.</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => setShowAddModal('fee')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg shadow-emerald-100">
                            <Plus size={18} /> Record Fee
                        </button>
                        <button onClick={() => setShowAddModal('expense')} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition font-bold shadow-lg shadow-rose-100">
                            <Plus size={18} /> Record Expense
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
                    <button onClick={() => setActiveTab('fees')} className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${activeTab === 'fees' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>Student Fees</button>
                    <button onClick={() => setActiveTab('salaries')} className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${activeTab === 'salaries' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>Teacher Salaries</button>
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
                                                    <p className="text-sm text-slate-500">{t.payment_date || t.expense_date} • {t.month_for || t.description}</p>
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

                    {activeTab === 'fees' && (
                        <div className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Student</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Code</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Month</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Date</th>
                                            <th className="px-6 py-4 text-sm font-bold text-slate-600">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {fees.map((f, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 font-bold text-slate-800">{f.lms_users?.name}</td>
                                                <td className="px-6 py-4 text-slate-500 font-mono text-sm">{f.lms_users?.student_code}</td>
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
                                                <td className="px-6 py-4 font-bold text-slate-800">{s.lms_users?.name}</td>
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
            {showAddModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                        <button onClick={() => setShowAddModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                            <Plus size={24} className="rotate-45" />
                        </button>

                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            {showAddModal === 'fee' ? <ArrowUpRight className="text-emerald-500" /> : <ArrowDownRight className="text-rose-500" />}
                            {showAddModal === 'fee' ? 'Record Student Fee' : showAddModal === 'salary' ? 'Record Teacher Salary' : 'Record Expense'}
                        </h2>

                        <form onSubmit={showAddModal === 'fee' ? handleAddFee : showAddModal === 'salary' ? handleAddSalary : handleAddExpense} className="space-y-4">
                            {showAddModal === 'fee' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Student</label>
                                    <select 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={feeForm.student_id}
                                        onChange={e => setFeeForm({...feeForm, student_id: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Student</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.student_code})</option>)}
                                    </select>
                                </div>
                            )}

                            {showAddModal === 'salary' && (
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
                            )}

                            {showAddModal === 'expense' && (
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
                            )}

                            {(showAddModal === 'fee' || showAddModal === 'salary') && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Month For</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. March 2026"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500 outline-none"
                                        value={showAddModal === 'fee' ? feeForm.month_for : salaryForm.month_for}
                                        onChange={e => showAddModal === 'fee' ? setFeeForm({...feeForm, month_for: e.target.value}) : setSalaryForm({...salaryForm, month_for: e.target.value})}
                                        required
                                    />
                                </div>
                            )}

                            {showAddModal === 'expense' && (
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
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Amount (Rs.)</label>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500 outline-none font-bold"
                                    value={showAddModal === 'fee' ? feeForm.amount : showAddModal === 'salary' ? salaryForm.amount : expenseForm.amount}
                                    onChange={e => showAddModal === 'fee' ? setFeeForm({...feeForm, amount: e.target.value}) : showAddModal === 'salary' ? setSalaryForm({...salaryForm, amount: e.target.value}) : setExpenseForm({...expenseForm, amount: e.target.value})}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-4 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${showAddModal === 'fee' ? 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700' : 'bg-rose-600 shadow-rose-100 hover:bg-rose-700'}`}
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
