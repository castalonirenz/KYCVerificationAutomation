"use client";

import { useEffect, useState } from "react";
import { getJson, ModuleItem, ModulePayload, postJson } from "./api";
import { Shell } from "./Shell";

export function AccessManagementPage() {
  const [users, setUsers] = useState<ModuleItem[]>([]);
  const [roles, setRoles] = useState<ModuleItem[]>([]);
  const [notice, setNotice] = useState("Ready");
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", department: "", status: "Active" });
  const [roleForm, setRoleForm] = useState({ name: "", description: "", permissions: "clients.manage,cases.manage" });

  async function load() {
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        getJson<ModulePayload>("/users"),
        getJson<ModulePayload>("/roles"),
      ]);
      setUsers(usersResponse.data);
      setRoles(rolesResponse.data);
    } catch {
      setNotice("Sign in with the temporary admin to manage access.");
    }
  }

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [usersResponse, rolesResponse] = await Promise.all([
          getJson<ModulePayload>("/users"),
          getJson<ModulePayload>("/roles"),
        ]);
        setUsers(usersResponse.data);
        setRoles(rolesResponse.data);
      } catch {
        setNotice("Sign in with the temporary admin to manage access.");
      }
    }

    loadInitialData();
  }, []);

  async function createUser() {
    setNotice("Creating user...");
    await postJson("/users", { ...userForm, mfa_enabled: false, role_ids: roles[0]?.id ? [roles[0].id] : [] });
    setUserForm({ name: "", email: "", password: "", department: "", status: "Active" });
    setNotice("User created.");
    load();
  }

  async function createRole() {
    setNotice("Creating role...");
    await postJson("/roles", { ...roleForm, permissions: roleForm.permissions.split(",").map((item) => item.trim()).filter(Boolean) });
    setRoleForm({ name: "", description: "", permissions: "clients.manage,cases.manage" });
    setNotice("Role created.");
    load();
  }

  return (
    <Shell title="User Access Management" description="Manage RBAC users, roles, and permissions.">
      <div className="grid gap-[16px] xl:grid-cols-2">
        <section className="bg-white p-[16px]">
          <h2 className="font-charter-bold text-[32px] leading-[1.1]">Create User</h2>
          <div className="mt-[16px] grid gap-[12px] md:grid-cols-2">
            {Object.entries(userForm).map(([key, value]) => (
              <label key={key} className="font-helvetica-medium text-[10.88px] leading-[1.35]">
                {key}
                <input value={value} type={key === "password" ? "password" : "text"} onChange={(event) => setUserForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]" />
              </label>
            ))}
          </div>
          <button onClick={createUser} className="mt-[16px] h-[32.64px] bg-[#FFAA72] px-[13.6px] py-[8.16px] font-helvetica-medium text-[12.24px] leading-[1.4] text-[#1F0606]">Create user</button>
        </section>
        <section className="bg-white p-[16px]">
          <h2 className="font-charter-bold text-[32px] leading-[1.1]">Create Role</h2>
          <div className="mt-[16px] grid gap-[12px]">
            {Object.entries(roleForm).map(([key, value]) => (
              <label key={key} className="font-helvetica-medium text-[10.88px] leading-[1.35]">
                {key}
                <input value={value} onChange={(event) => setRoleForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]" />
              </label>
            ))}
          </div>
          <button onClick={createRole} className="mt-[16px] h-[32.64px] bg-[#FFAA72] px-[13.6px] py-[8.16px] font-helvetica-medium text-[12.24px] leading-[1.4] text-[#1F0606]">Create role</button>
        </section>
      </div>
      <section className="mt-[16px] grid gap-[16px] lg:grid-cols-2">
        <div className="bg-white p-[16px]"><h2 className="font-charter-bold text-[32px] leading-[1.1]">Users</h2>{users.map((user) => <p key={String(user.id)} className="mt-[8px] border-t-[0.697px] border-[#CBD1D6] pt-[8px] font-helvetica-regular text-[12.24px] leading-[1.4]">{user.name} - {user.email} - {Array.isArray(user.roles) ? user.roles.join(", ") : ""}</p>)}</div>
        <div className="bg-white p-[16px]"><h2 className="font-charter-bold text-[32px] leading-[1.1]">Roles</h2>{roles.map((role) => <p key={String(role.id)} className="mt-[8px] border-t-[0.697px] border-[#CBD1D6] pt-[8px] font-helvetica-regular text-[12.24px] leading-[1.4]">{role.name} - {Array.isArray(role.permissions) ? role.permissions.join(", ") : ""}</p>)}</div>
      </section>
      <p className="mt-[12px] font-helvetica-regular text-[9.761px] leading-[1.4] text-[#626771]">{notice}</p>
    </Shell>
  );
}
