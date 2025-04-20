'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../components/SupabaseCred';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Employee = {
  email: string;
  role: string;
};

export default function AddEmp() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const getUserDetails = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
  
      if (sessionError || !session) {
        toast.error("No session found. Please login again.");
        return;
      }
  
      const { user } = session;
      if (!user?.email) {
        toast.error("User email not found.");
        return;
      }
  
      setAdminEmail(user.email);
      fetchEmployees(user.email);
    };
  
    getUserDetails();
  }, []);   

  const fetchEmployees = async (adminEmail: string | null) => {
    if (!adminEmail) return;
    const { data, error } = await supabase
      .from('organization')
      .select('employees')
      .eq('admin_email', adminEmail)
      .single();

    if (data) {
      setEmployees(data.employees || []);
    }
  };

  const handleAddEmployee = async () => {
    setError('');
    if (!email.trim()) return setError('Email is required');

    const { data: employee, error: employeeError } = await supabase
    .from('users')
    .select('email, role')
    .eq('email', email)
    .single(); 

    if(!employee || employeeError){
      setError('Employee not exist ❌');
      return;
    } 

    const role = employee.role || 'user';

    // Step 2: Fetch current org employees
    const { data: orgData, error: orgError } = await supabase
      .from('organization')
      .select('employees')
      .eq('admin_email', adminEmail)
      .maybeSingle();

    if (orgError) {
      toast.error('Error fetching organization');
      return;
    }

    const currentEmployees = orgData?.employees || [];

    // Step 3: Prevent duplicate
    const alreadyExists = currentEmployees.some((emp: Employee) => emp.email === email);
    if (alreadyExists) {
      setError('Employee already added');
      return;
    }

    // Step 4: Update list
    const updatedEmployees = [...currentEmployees, { email, role }];

    // Step 5: Upsert the updated list
    const { error: updateError } = await supabase
      .from('organization')
      .upsert(
        { admin_email: adminEmail, employees: updatedEmployees },
        { onConflict: 'admin_email' }
      );

    // Step 6: Result
    if (!updateError) {
      toast.success('Employee Added ✅');
      setEmployees(updatedEmployees);
      setEmail('');
      setOpen(false);
    } else {
      toast.error('Something went wrong');
      console.log(updateError);
    }
  };

  const handleDelete = async (targetEmail: string) => {
    const updatedEmployees = employees.filter(emp => emp.email !== targetEmail);

    const { error: deleteError } = await supabase
      .from('organization')
      .update({ employees: updatedEmployees })
      .eq('admin_email', adminEmail);

    if (!deleteError) {
      toast.success('Employee removed');
      setEmployees(updatedEmployees);
    } else {
      toast.error('Error removing employee');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Team</h2>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg" onClick={() => setOpen(true)}>
          Add Employee
        </Button>
      </div>
  
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-4 text-sm font-semibold">Email</th>
              <th className="p-4 text-sm font-semibold">Role</th>
              <th className="p-4 text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp: Employee, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm">{emp.email}</td>
                <td className="p-4 text-sm capitalize">{emp.role}</td>
                <td className="p-4 text-sm">
                  <Button
                    variant="destructive"
                    className="px-3 py-1 text-sm rounded-md"
                    onClick={() => handleDelete(emp.email)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold mb-4">Add Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter employee email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              onClick={handleAddEmployee}
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );  
}
