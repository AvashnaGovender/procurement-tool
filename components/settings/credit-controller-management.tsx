"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCog, Plus, Trash2, RotateCcw, AlertCircle, CheckCircle, Edit } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreditController {
  id: string
  name: string
  isActive: boolean
  createdAt: string
}

interface CreditControllerRule {
  id: string
  businessUnit: string
  ruleType: 'FIXED' | 'ALPHA_RANGE'
  fromLetter: string | null
  toLetter: string | null
  controllerName: string
  sortOrder: number
  isActive: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BU_LABELS: Record<string, string> = {
  SCHAUENBURG_SYSTEMS_200: 'Schauenburg Systems (Pty) Ltd 300',
  SCHAUENBURG_PTY_LTD_300: 'Schauenburg (Pty) Ltd 200',
}

const KNOWN_BUS = Object.keys(BU_LABELS)

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function buLabel(bu: string) {
  return BU_LABELS[bu] ?? bu
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreditControllerManagement() {
  // ── Controllers state ──
  const [controllers, setControllers] = useState<CreditController[]>([])
  const [controllersLoading, setControllersLoading] = useState(true)
  const [newControllerName, setNewControllerName] = useState("")
  const [addingController, setAddingController] = useState(false)
  const [deleteControllerTarget, setDeleteControllerTarget] = useState<CreditController | null>(null)
  const [deleteControllerOpen, setDeleteControllerOpen] = useState(false)

  // ── Rules state ──
  const [rules, setRules] = useState<CreditControllerRule[]>([])
  const [rulesLoading, setRulesLoading] = useState(true)
  const [addRuleOpen, setAddRuleOpen] = useState(false)
  const [editRuleTarget, setEditRuleTarget] = useState<CreditControllerRule | null>(null)
  const [editRuleOpen, setEditRuleOpen] = useState(false)
  const [deleteRuleTarget, setDeleteRuleTarget] = useState<CreditControllerRule | null>(null)
  const [deleteRuleOpen, setDeleteRuleOpen] = useState(false)

  // Add/edit rule form
  const emptyRuleForm = { businessUnit: '', ruleType: 'ALPHA_RANGE' as 'FIXED' | 'ALPHA_RANGE', fromLetter: 'A', toLetter: 'D', controllerName: '' }
  const [ruleForm, setRuleForm] = useState(emptyRuleForm)

  // ── Shared feedback ──
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => { fetchControllers(); fetchRules() }, [])

  const clearMessages = () => { setError(""); setSuccess("") }

  // ── Controller helpers ──────────────────────────────────────────────────────

  const fetchControllers = async () => {
    try {
      const res = await fetch("/api/settings/credit-controllers")
      const data = await res.json()
      if (data.success) setControllers(data.controllers)
    } catch { setError("Failed to load controllers") }
    finally { setControllersLoading(false) }
  }

  const handleAddController = async () => {
    clearMessages()
    if (!newControllerName.trim()) { setError("Enter a controller name"); return }
    setAddingController(true)
    try {
      const res = await fetch("/api/settings/credit-controllers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newControllerName.trim() }),
      })
      const data = await res.json()
      if (data.success) { setSuccess(`"${newControllerName.trim()}" added`); setNewControllerName(""); await fetchControllers() }
      else setError(data.error || "Failed to add controller")
    } catch { setError("Failed to add controller") }
    finally { setAddingController(false) }
  }

  const handleToggleController = async (c: CreditController) => {
    clearMessages()
    try {
      const res = await fetch(`/api/settings/credit-controllers/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive }),
      })
      const data = await res.json()
      if (data.success) { setSuccess(`"${c.name}" ${!c.isActive ? "reactivated" : "deactivated"}`); await fetchControllers() }
      else setError(data.error || "Failed to update")
    } catch { setError("Failed to update controller") }
  }

  const handleDeleteController = async () => {
    if (!deleteControllerTarget) return
    clearMessages()
    try {
      const res = await fetch(`/api/settings/credit-controllers/${deleteControllerTarget.id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) { setSuccess(`"${deleteControllerTarget.name}" deleted`); setDeleteControllerOpen(false); setDeleteControllerTarget(null); await fetchControllers() }
      else setError(data.error || "Failed to delete")
    } catch { setError("Failed to delete controller") }
  }

  // ── Rule helpers ────────────────────────────────────────────────────────────

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/settings/credit-controller-rules")
      const data = await res.json()
      if (data.success) setRules(data.rules)
    } catch { setError("Failed to load rules") }
    finally { setRulesLoading(false) }
  }

  const activeControllerNames = controllers.filter(c => c.isActive).map(c => c.name)

  const handleAddRule = async () => {
    clearMessages()
    if (!ruleForm.businessUnit) { setError("Select a business unit"); return }
    if (!ruleForm.controllerName) { setError("Select a controller"); return }
    try {
      const res = await fetch("/api/settings/credit-controller-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleForm),
      })
      const data = await res.json()
      if (data.success) { setSuccess("Rule added"); setAddRuleOpen(false); setRuleForm(emptyRuleForm); await fetchRules() }
      else setError(data.error || "Failed to add rule")
    } catch { setError("Failed to add rule") }
  }

  const handleSaveEditRule = async () => {
    if (!editRuleTarget) return
    clearMessages()
    try {
      const res = await fetch(`/api/settings/credit-controller-rules/${editRuleTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromLetter: ruleForm.ruleType === 'ALPHA_RANGE' ? ruleForm.fromLetter : null,
          toLetter:   ruleForm.ruleType === 'ALPHA_RANGE' ? ruleForm.toLetter   : null,
          controllerName: ruleForm.controllerName,
        }),
      })
      const data = await res.json()
      if (data.success) { setSuccess("Rule updated"); setEditRuleOpen(false); setEditRuleTarget(null); await fetchRules() }
      else setError(data.error || "Failed to update rule")
    } catch { setError("Failed to update rule") }
  }

  const handleDeleteRule = async () => {
    if (!deleteRuleTarget) return
    clearMessages()
    try {
      const res = await fetch(`/api/settings/credit-controller-rules/${deleteRuleTarget.id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) { setSuccess("Rule deleted"); setDeleteRuleOpen(false); setDeleteRuleTarget(null); await fetchRules() }
      else setError(data.error || "Failed to delete rule")
    } catch { setError("Failed to delete rule") }
  }

  // Group rules by BU for display
  const rulesByBU = rules.reduce<Record<string, CreditControllerRule[]>>((acc, r) => {
    if (!acc[r.businessUnit]) acc[r.businessUnit] = []
    acc[r.businessUnit].push(r)
    return acc
  }, {})

  const openEditRule = (rule: CreditControllerRule) => {
    setEditRuleTarget(rule)
    setRuleForm({
      businessUnit: rule.businessUnit,
      ruleType: rule.ruleType,
      fromLetter: rule.fromLetter ?? 'A',
      toLetter: rule.toLetter ?? 'Z',
      controllerName: rule.controllerName,
    })
    setEditRuleOpen(true)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <UserCog className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Credit Controller Management</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Manage the list of credit controllers and configure which controller is auto-assigned
        based on business unit and supplier name.
      </p>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="controllers">
        <TabsList className="mb-6">
          <TabsTrigger value="controllers">Controllers</TabsTrigger>
          <TabsTrigger value="rules">Assignment Rules</TabsTrigger>
        </TabsList>

        {/* ── Controllers tab ────────────────────────────────────────────── */}
        <TabsContent value="controllers">
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="New controller name (e.g. Thandi)"
              value={newControllerName}
              onChange={e => { setNewControllerName(e.target.value); clearMessages() }}
              onKeyDown={e => e.key === "Enter" && handleAddController()}
              className="max-w-xs"
            />
            <Button onClick={handleAddController} disabled={addingController || !newControllerName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              {addingController ? "Adding…" : "Add Controller"}
            </Button>
          </div>

          {controllersLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {controllers.map(c => (
                  <TableRow key={c.id} className={!c.isActive ? "opacity-50" : ""}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? "default" : "secondary"}>
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleToggleController(c)}>
                          <RotateCcw className="h-4 w-4 mr-1" />
                          {c.isActive ? "Deactivate" : "Reactivate"}
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => { setDeleteControllerTarget(c); setDeleteControllerOpen(true) }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {controllers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No credit controllers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* ── Rules tab ──────────────────────────────────────────────────── */}
        <TabsContent value="rules">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              Rules are evaluated top-to-bottom per business unit. <strong>Fixed</strong> rules
              always win; <strong>Alphabetical range</strong> rules match on the supplier's first
              letter.
            </p>
            <Button onClick={() => { setRuleForm(emptyRuleForm); setAddRuleOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>

          {rulesLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : Object.keys(rulesByBU).length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No rules configured</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(rulesByBU)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([bu, buRules]) => (
                  <div key={bu}>
                    <h3 className="font-medium text-sm mb-2">
                      {buLabel(bu)}
                      <span className="ml-2 text-xs text-muted-foreground font-normal">({bu})</span>
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Range</TableHead>
                          <TableHead>Controller</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {buRules
                          .sort((a, b) => {
                            if (a.ruleType === 'FIXED' && b.ruleType !== 'FIXED') return -1
                            if (a.ruleType !== 'FIXED' && b.ruleType === 'FIXED') return 1
                            return a.sortOrder - b.sortOrder
                          })
                          .map(rule => (
                            <TableRow key={rule.id} className={!rule.isActive ? "opacity-50" : ""}>
                              <TableCell>
                                <Badge variant={rule.ruleType === 'FIXED' ? "default" : "outline"}>
                                  {rule.ruleType === 'FIXED' ? 'Fixed' : 'Alpha Range'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {rule.ruleType === 'ALPHA_RANGE' && rule.fromLetter && rule.toLetter
                                  ? `${rule.fromLetter} – ${rule.toLetter}`
                                  : '—'}
                              </TableCell>
                              <TableCell className="font-medium">{rule.controllerName}</TableCell>
                              <TableCell>
                                <Badge variant={rule.isActive ? "default" : "secondary"} className="text-xs">
                                  {rule.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => openEditRule(rule)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost" size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => { setDeleteRuleTarget(rule); setDeleteRuleOpen(true) }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Add Rule dialog ────────────────────────────────────────────────── */}
      <Dialog open={addRuleOpen} onOpenChange={setAddRuleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Assignment Rule</DialogTitle>
            <DialogDescription>
              Define when a credit controller should be auto-assigned for a business unit.
            </DialogDescription>
          </DialogHeader>
          <RuleForm
            form={ruleForm}
            onChange={setRuleForm}
            controllerNames={activeControllerNames}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRuleOpen(false)}>Cancel</Button>
            <Button onClick={handleAddRule}>Add Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Rule dialog ───────────────────────────────────────────────── */}
      <Dialog open={editRuleOpen} onOpenChange={setEditRuleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Rule</DialogTitle>
            <DialogDescription>
              Update the range or controller for this rule.
            </DialogDescription>
          </DialogHeader>
          <RuleForm
            form={ruleForm}
            onChange={setRuleForm}
            controllerNames={activeControllerNames}
            disableBusinessUnit
            disableRuleType
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRuleOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEditRule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Rule confirmation ───────────────────────────────────────── */}
      <Dialog open={deleteRuleOpen} onOpenChange={setDeleteRuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Rule</DialogTitle>
            <DialogDescription>
              Delete the {deleteRuleTarget?.ruleType === 'FIXED' ? 'fixed' : 'alphabetical range'} rule
              for <strong>{buLabel(deleteRuleTarget?.businessUnit ?? '')}</strong>
              {deleteRuleTarget?.ruleType === 'ALPHA_RANGE' &&
                ` (${deleteRuleTarget.fromLetter}–${deleteRuleTarget.toLetter})`}
              {' '}→ <strong>{deleteRuleTarget?.controllerName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRuleOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRule}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Controller confirmation ─────────────────────────────────── */}
      <Dialog open={deleteControllerOpen} onOpenChange={setDeleteControllerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Credit Controller</DialogTitle>
            <DialogDescription>
              Permanently delete <strong>{deleteControllerTarget?.name}</strong>? Suppliers already
              assigned to this controller keep the name on their records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteControllerOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteController}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── RuleForm sub-component ───────────────────────────────────────────────────

interface RuleFormProps {
  form: { businessUnit: string; ruleType: 'FIXED' | 'ALPHA_RANGE'; fromLetter: string; toLetter: string; controllerName: string }
  onChange: (f: RuleFormProps['form']) => void
  controllerNames: string[]
  disableBusinessUnit?: boolean
  disableRuleType?: boolean
}

const KNOWN_BUS_WITH_LABELS = [
  { value: 'SCHAUENBURG_SYSTEMS_200', label: 'Schauenburg Systems (Pty) Ltd 300' },
  { value: 'SCHAUENBURG_PTY_LTD_300', label: 'Schauenburg (Pty) Ltd 200' },
]

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function RuleForm({ form, onChange, controllerNames, disableBusinessUnit, disableRuleType }: RuleFormProps) {
  const set = (key: keyof typeof form, val: string) => onChange({ ...form, [key]: val })

  return (
    <div className="space-y-4 py-2">
      {/* Business Unit */}
      <div className="space-y-1">
        <Label>Business Unit</Label>
        {disableBusinessUnit ? (
          <p className="text-sm font-medium">{BU_LABELS[form.businessUnit] ?? form.businessUnit}</p>
        ) : (
          <Select value={form.businessUnit} onValueChange={v => set('businessUnit', v)}>
            <SelectTrigger><SelectValue placeholder="Select business unit" /></SelectTrigger>
            <SelectContent>
              {KNOWN_BUS_WITH_LABELS.map(bu => (
                <SelectItem key={bu.value} value={bu.value}>{bu.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Rule Type */}
      <div className="space-y-1">
        <Label>Rule Type</Label>
        {disableRuleType ? (
          <p className="text-sm font-medium">{form.ruleType === 'FIXED' ? 'Fixed Controller' : 'Alphabetical Range'}</p>
        ) : (
          <Select value={form.ruleType} onValueChange={v => set('ruleType', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALPHA_RANGE">Alphabetical Range — assign by first letter of supplier name</SelectItem>
              <SelectItem value="FIXED">Fixed — always assign this controller for this BU</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Letter range (only for ALPHA_RANGE) */}
      {form.ruleType === 'ALPHA_RANGE' && (
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <Label>From letter</Label>
            <Select value={form.fromLetter} onValueChange={v => set('fromLetter', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LETTERS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1">
            <Label>To letter</Label>
            <Select value={form.toLetter} onValueChange={v => set('toLetter', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LETTERS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Controller */}
      <div className="space-y-1">
        <Label>Assign to Controller</Label>
        <Select value={form.controllerName} onValueChange={v => set('controllerName', v)}>
          <SelectTrigger><SelectValue placeholder="Select controller" /></SelectTrigger>
          <SelectContent>
            {controllerNames.map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
