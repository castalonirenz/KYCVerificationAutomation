"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteJson, getJson, ModuleItem, ModulePayload, postJson, putJson } from "./api";
import { Shell } from "./Shell";

type UserForm = {
  id?: number;
  name: string;
  email: string;
  password: string;
  department: string;
  status: string;
  mfa_enabled: boolean;
  role_ids: number[];
};

const emptyUserForm: UserForm = {
  name: "",
  email: "",
  password: "",
  department: "",
  status: "Active",
  mfa_enabled: false,
  role_ids: [],
};

const statuses = ["Active", "Disabled", "Password reset required"];

function numberArray(value: ModuleItem[string]): number[] {
  return Array.isArray(value) ? value.map(Number).filter(Number.isFinite) : [];
}

export function AccessManagementPage() {
  const [users, setUsers] = useState<ModuleItem[]>([]);
  const [roles, setRoles] = useState<ModuleItem[]>([]);
  const [notice, setNotice] = useState("Sign in as admin@kyc.local / TempAdmin123! to manage users.");
  const [userForm, setUserForm] = useState<UserForm>(emptyUserForm);
  const [roleForm, setRoleForm] = useState({ name: "", description: "", permissions: "users.manage,roles.manage" });

  const selectedUser = useMemo(
    () => users.find((user) => Number(user.id) === userForm.id),
    [userForm.id, users],
  );

  async function load() {
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        getJson<ModulePayload>("/users"),
        getJson<ModulePayload>("/roles"),
      ]);
      setUsers(usersResponse.data);
      setRoles(rolesResponse.data);
      setNotice("Connected with Passport token.");
    } catch {
      setNotice("Sign in with the temporary admin before managing access.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function editUser(user: ModuleItem) {
    setUserForm({
      id: Number(user.id),
      name: String(user.name ?? ""),
      email: String(user.email ?? ""),
      password: "",
      department: String(user.department ?? ""),
      status: String(user.status ?? "Active"),
      mfa_enabled: Boolean(user.mfa_enabled),
      role_ids: numberArray(user.role_ids),
    });
    setNotice(`Editing ${String(user.email ?? "user")}. Leave password blank to keep it unchanged.`);
  }

  function toggleRole(roleId: number) {
    setUserForm((current) => ({
      ...current,
      role_ids: current.role_ids.includes(roleId)
        ? current.role_ids.filter((id) => id !== roleId)
        : [...current.role_ids, roleId],
    }));
  }

  async function saveUser() {
    if (!userForm.id && !userForm.password) {
      setNotice("Password is required for new users.");
      return;
    }

    setNotice(userForm.id ? "Updating user..." : "Creating user...");
    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        department: userForm.department || null,
        status: userForm.status,
        mfa_enabled: userForm.mfa_enabled,
        role_ids: userForm.role_ids,
        ...(userForm.password ? { password: userForm.password } : {}),
      };

      if (userForm.id) {
        await putJson(`/users/${userForm.id}`, payload);
        await load();
        setNotice("User updated.");
      } else {
        await postJson("/users", { ...payload, password: userForm.password });
        await load();
        setNotice("User created.");
      }

      setUserForm(emptyUserForm);
    } catch {
      setNotice("User save failed. Check required fields and admin permissions.");
    }
  }

  async function deleteUser() {
    if (!userForm.id) return;

    setNotice("Deleting user...");
    try {
      await deleteJson(`/users/${userForm.id}`);
      setUserForm(emptyUserForm);
      await load();
      setNotice("User deleted.");
    } catch {
      setNotice("User delete failed. You cannot delete your own account.");
    }
  }

  async function createRole() {
    setNotice("Creating role...");
    try {
      await postJson("/roles", {
        ...roleForm,
        permissions: roleForm.permissions.split(",").map((item) => item.trim()).filter(Boolean),
      });
      setRoleForm({ name: "", description: "", permissions: "users.manage,roles.manage" });
      await load();
      setNotice("Role created.");
    } catch {
      setNotice("Role create failed. Check the role name and permissions.");
    }
  }

  return (
    <Shell title="User Access Management" description="Create, update, disable, and delete application users with Passport-protected admin access.">
      <div className="grid gap-[16px] xl:grid-cols-[1.2fr_0.8fr]">
        <section className="bg-white p-[16px]">
          <div className="flex flex-wrap items-center justify-between gap-[12px]">
            <h2 className="font-charter-bold text-[28px] leading-[1.1]">{userForm.id ? "Update User" : "Create User"}</h2>
            <button onClick={() => setUserForm(emptyUserForm)} className="h-[32.64px] border-[0.697px] border-[#626771] px-[13.6px] font-helvetica-medium text-[12.24px] leading-[1.4]">
              New user
            </button>
          </div>
          <div className="mt-[16px] grid gap-[12px] md:grid-cols-2">
            <label className="font-helvetica-medium text-[10.88px] leading-[1.35]">
              Name
              <input value={userForm.name} onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))} className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]" />
            </label>
            <label className="font-helvetica-medium text-[10.88px] leading-[1.35]">
              Email
              <input value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]" />
            </label>
            <label className="font-helvetica-medium text-[10.88px] leading-[1.35]">
              Password
              <input type="password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} placeholder={userForm.id ? "Leave blank to keep current password" : ""} className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]" />
            </label>
            <label className="font-helvetica-medium text-[10.88px] leading-[1.35]">
              Department
              <input value={userForm.department} onChange={(event) => setUserForm((current) => ({ ...current, department: event.target.value }))} className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]" />
            </label>
            <label className="font-helvetica-medium text-[10.88px] leading-[1.35]">
              Status
              <select value={userForm.status} onChange={(event) => setUserForm((current) => ({ ...current, status: event.target.value }))} className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] bg-white px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]">
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="flex items-end gap-[8px] font-helvetica-medium text-[10.88px] leading-[1.35]">
              <input type="checkbox" checked={userForm.mfa_enabled} onChange={(event) => setUserForm((current) => ({ ...current, mfa_enabled: event.target.checked }))} />
              MFA enabled
            </label>
          </div>
          <div className="mt-[16px]">
            <p className="font-helvetica-medium text-[10.88px] leading-[1.35]">Roles</p>
            <div className="mt-[8px] flex flex-wrap gap-[8px]">
              {roles.map((role) => {
                const roleId = Number(role.id);
                const selected = userForm.role_ids.includes(roleId);
                return (
                  <button key={String(role.id)} onClick={() => toggleRole(roleId)} className={`px-[10px] py-[6px] font-helvetica-medium text-[12.24px] leading-[1.4] ${selected ? "bg-[#FFAA72] text-[#1F0606]" : "border-[0.697px] border-[#A1A8B3]"}`}>
                    {String(role.name)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-[16px] flex flex-wrap gap-[8px]">
            <button onClick={saveUser} className="h-[32.64px] bg-[#FFAA72] px-[13.6px] font-helvetica-medium text-[12.24px] leading-[1.4] text-[#1F0606]">{userForm.id ? "Save changes" : "Create user"}</button>
            {userForm.id && <button onClick={deleteUser} className="h-[32.64px] bg-[#111113] px-[13.6px] font-helvetica-medium text-[12.24px] leading-[1.4] text-white">Delete user</button>}
          </div>
        </section>

        <section className="bg-white p-[16px]">
          <h2 className="font-charter-bold text-[28px] leading-[1.1]">Create Role</h2>
          <div className="mt-[16px] grid gap-[12px]">
            {Object.entries(roleForm).map(([key, value]) => (
              <label key={key} className="font-helvetica-medium text-[10.88px] leading-[1.35]">
                {key}
                <input value={value} onChange={(event) => setRoleForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]" />
              </label>
            ))}
          </div>
          <button onClick={createRole} className="mt-[16px] h-[32.64px] bg-[#FFAA72] px-[13.6px] font-helvetica-medium text-[12.24px] leading-[1.4] text-[#1F0606]">Create role</button>
        </section>
      </div>

      <section className="mt-[16px] grid gap-[16px] lg:grid-cols-2">
        <div className="bg-white p-[16px]">
          <h2 className="font-charter-bold text-[28px] leading-[1.1]">Users</h2>
          {users.map((user) => (
            <button key={String(user.id)} onClick={() => editUser(user)} className={`mt-[8px] block w-full border-t-[0.697px] border-[#CBD1D6] pt-[8px] text-left font-helvetica-regular text-[12.24px] leading-[1.4] ${selectedUser?.id === user.id ? "text-[#FD5109]" : ""}`}>
              {String(user.name)} - {String(user.email)} - {Array.isArray(user.roles) ? user.roles.join(", ") : ""}
            </button>
          ))}
        </div>
        <div className="bg-white p-[16px]">
          <h2 className="font-charter-bold text-[28px] leading-[1.1]">Roles</h2>
          {roles.map((role) => <p key={String(role.id)} className="mt-[8px] border-t-[0.697px] border-[#CBD1D6] pt-[8px] font-helvetica-regular text-[12.24px] leading-[1.4]">{String(role.name)} - {Array.isArray(role.permissions) ? role.permissions.join(", ") : ""}</p>)}
        </div>
      </section>
      <p className="mt-[12px] font-helvetica-regular text-[9.761px] leading-[1.4] text-[#626771]">{notice}</p>
    </Shell>
  );
}
