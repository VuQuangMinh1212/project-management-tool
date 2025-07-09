"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Calendar,
  Clock,
  User,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Task, BatchApprovalData } from "@/types/task";
import { TaskStatus } from "@/types/task";
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_COLORS,
} from "@/constants/taskStatus";
import { 
  formatWeekForDisplay,
} from "@/lib/utils/weekUtils";

interface TaskBatch {
  id: string;
  staffId: string;
  staffName: string;
  staffAvatar?: string;
  weekSubmittedFor: string;
  submittedAt: string;
  tasks: Task[];
}

interface ManagerApprovalProps {
  pendingBatches: TaskBatch[];
  onBatchApproval: (approvalData: BatchApprovalData) => void;
}

interface TaskDecision {
  taskId: string;
  status: 'in_progress' | 'rejected' | 'pending'; // Changed 'approved' to 'in_progress'
  comment: string;
}

export function ManagerApproval({ pendingBatches, onBatchApproval }: ManagerApprovalProps) {
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  const [taskDecisions, setTaskDecisions] = useState<Record<string, TaskDecision>>({});
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleBatchExpanded = (batchId: string) => {
    const newExpanded = new Set(expandedBatches);
    if (newExpanded.has(batchId)) {
      newExpanded.delete(batchId);
    } else {
      newExpanded.add(batchId);
    }
    setExpandedBatches(newExpanded);
  };

  const updateTaskDecision = (taskId: string, status: 'in_progress' | 'rejected', comment: string = '') => {
    setTaskDecisions(prev => ({
      ...prev,
      [taskId]: { taskId, status, comment }
    }));
  };

  const updateTaskComment = (taskId: string, comment: string) => {
    setTaskDecisions(prev => ({
      ...prev,
      [taskId]: { 
        ...prev[taskId],
        taskId, 
        status: prev[taskId]?.status || 'pending',
        comment 
      }
    }));
  };

  const handleBulkApproval = (batchId: string, status: 'in_progress' | 'rejected') => {
    const batch = pendingBatches.find(b => b.id === batchId);
    if (!batch) return;

    const updates: Record<string, TaskDecision> = {};
    batch.tasks.forEach(task => {
      updates[task.id] = {
        taskId: task.id,
        status,
        comment: taskDecisions[task.id]?.comment || ''
      };
    });

    setTaskDecisions(prev => ({ ...prev, ...updates }));
  };

  const getDecisionCounts = (batchId: string) => {
    const batch = pendingBatches.find(b => b.id === batchId);
    if (!batch) return { inProgress: 0, rejected: 0, pending: 0 };

    const decisions = batch.tasks.map(task => taskDecisions[task.id]?.status || 'pending');
    return {
      inProgress: decisions.filter(d => d === 'in_progress').length,
      rejected: decisions.filter(d => d === 'rejected').length,
      pending: decisions.filter(d => d === 'pending').length,
    };
  };

  const canSubmitBatch = (batchId: string) => {
    const batch = pendingBatches.find(b => b.id === batchId);
    if (!batch) return false;

    return batch.tasks.every(task => {
      const decision = taskDecisions[task.id];
      return decision && decision.status !== 'pending';
    });
  };

  const handleSubmitBatch = async (batchId: string) => {
    const batch = pendingBatches.find(b => b.id === batchId);
    if (!batch || !canSubmitBatch(batchId)) return;

    setIsSubmitting(true);
    try {
      const approvals = batch.tasks.map(task => {
        const decision = taskDecisions[task.id];
        return {
          taskId: task.id,
          status: decision.status as 'in_progress' | 'rejected',
          comment: decision.comment
        };
      });

      await onBatchApproval({ batchId, approvals });
      
      const clearedDecisions = { ...taskDecisions };
      batch.tasks.forEach(task => {
        delete clearedDecisions[task.id];
      });
      setTaskDecisions(clearedDecisions);
      
      setIsSubmitDialogOpen(false);
      setSelectedBatchId(null);
    } catch (error) {
      console.error("Error submitting batch approval:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pendingBatches.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No pending approvals</h3>
              <p className="text-gray-500 mt-1">
                All task submissions have been reviewed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pending Task Approvals</h2>
        <p className="text-gray-600">
          Review and approve or reject task submissions from your team.
        </p>
      </div>

      {pendingBatches.map((batch) => {
        const isExpanded = expandedBatches.has(batch.id);
        const counts = getDecisionCounts(batch.id);
        const canSubmit = canSubmitBatch(batch.id);

        return (
          <Card key={batch.id}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleBatchExpanded(batch.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{batch.staffName}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatWeekForDisplay(batch.weekSubmittedFor)}
                            </span>
                            <span>
                              Submitted {format(new Date(batch.submittedAt), "MMM d, h:mm a")}
                            </span>
                            <span>
                              {batch.tasks.length} task{batch.tasks.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {counts.inProgress > 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          {counts.inProgress} approved
                        </Badge>
                      )}
                      {counts.rejected > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                          {counts.rejected} rejected
                        </Badge>
                      )}
                      {counts.pending > 0 && (
                        <Badge variant="outline">
                          {counts.pending} pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  {/* Bulk Actions */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Bulk actions:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkApproval(batch.id, 'in_progress')}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Approve All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkApproval(batch.id, 'rejected')}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject All
                    </Button>
                  </div>

                  {/* Individual Tasks */}
                  <div className="space-y-4">
                    {batch.tasks.map((task) => {
                      const decision = taskDecisions[task.id];
                      const status = decision?.status || 'pending';

                      return (
                        <div
                          key={task.id}
                          className={`border rounded-lg p-4 ${
                            status === 'in_progress' ? 'border-green-200 bg-green-50' :
                            status === 'rejected' ? 'border-red-200 bg-red-50' :
                            'border-gray-200'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Task Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium">{task.title}</h4>
                                  <Badge 
                                    className={TASK_PRIORITY_COLORS[task.priority]}
                                    variant="secondary"
                                  >
                                    {TASK_PRIORITY_LABELS[task.priority]}
                                  </Badge>
                                </div>
                                
                                {task.description && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  {task.estimatedHours && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {task.estimatedHours}h estimated
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span>
                                      Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                                    </span>
                                  )}
                                  {task.projectName && (
                                    <span>Project: {task.projectName}</span>
                                  )}
                                </div>
                              </div>

                              {/* Decision Buttons */}
                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant={status === 'in_progress' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateTaskDecision(task.id, 'in_progress')}
                                  className={status === 'in_progress' ? 'bg-green-600 hover:bg-green-700' : ''}
                                >
                                  <CheckCircle2 className="mr-1 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  variant={status === 'rejected' ? 'destructive' : 'outline'}
                                  size="sm"
                                  onClick={() => updateTaskDecision(task.id, 'rejected')}
                                >
                                  <XCircle className="mr-1 h-4 w-4" />
                                  Reject
                                </Button>
                              </div>
                            </div>

                            {/* Comment Section */}
                            <div className="space-y-2">
                              <Label htmlFor={`comment-${task.id}`} className="text-sm">
                                Comment {status === 'rejected' && <span className="text-red-500">*</span>}
                              </Label>
                              <Textarea
                                id={`comment-${task.id}`}
                                placeholder={
                                  status === 'in_progress' 
                                    ? "Optional feedback for the staff member..."
                                    : status === 'rejected'
                                    ? "Please explain why this task was rejected..."
                                    : "Add your comments..."
                                }
                                value={decision?.comment || ''}
                                onChange={(e) => updateTaskComment(task.id, e.target.value)}
                                rows={2}
                                className={status === 'rejected' && !decision?.comment ? 'border-red-300' : ''}
                              />
                              {status === 'rejected' && !decision?.comment && (
                                <p className="text-xs text-red-600">
                                  Please provide a reason for rejection
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Actions */}
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {counts.pending > 0 ? (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {counts.pending} task{counts.pending !== 1 ? 's' : ''} pending review
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          All tasks reviewed
                        </span>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => {
                        setSelectedBatchId(batch.id);
                        setIsSubmitDialogOpen(true);
                      }}
                      disabled={!canSubmit}
                    >
                      Submit Decisions
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      {/* Confirmation Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Task Decisions</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedBatchId && (() => {
              const batch = pendingBatches.find(b => b.id === selectedBatchId);
              const counts = getDecisionCounts(selectedBatchId);
              
              return batch ? (
                <>
                  <p>
                    You are about to submit decisions for {batch.staffName}'s task submission:
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Week:</span>
                      <span className="font-medium">{formatWeekForDisplay(batch.weekSubmittedFor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tổng nhiệm vụ:</span>
                      <span className="font-medium">{batch.tasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved:</span>
                      <span className="font-medium text-green-600">{counts.inProgress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected:</span>
                      <span className="font-medium text-red-600">{counts.rejected}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    The staff member will be notified of your decisions and can view your comments.
                  </p>
                </>
              ) : null;
            })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedBatchId && handleSubmitBatch(selectedBatchId)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Decisions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
