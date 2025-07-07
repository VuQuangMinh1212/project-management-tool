"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, X, Clock, AlertCircle, Users } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchWithSuggestions } from "@/components/shared/ui/SearchWithSuggestions";
import { FilterDropdown } from "@/components/shared/ui/FilterDropdown";

interface ApprovalRequest {
  id: string;
  type: "task_completion" | "time_off" | "expense" | "project_change";
  title: string;
  description: string;
  requestedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "medium" | "high";
  details: any;
}

// Mock data remains the same
const mockApprovals: ApprovalRequest[] = [
  {
    id: "1",
    type: "task_completion",
    title: "Task Completion: Implement user authentication",
    description: "Requesting approval for task completion with 8 hours logged",
    requestedBy: {
      id: "user1",
      name: "John Doe",
    },
    requestedAt: "2024-01-10T10:00:00Z",
    status: "pending",
    priority: "high",
    details: {
      taskId: "task1",
      hoursLogged: 8,
      completionNotes:
        "Successfully implemented JWT authentication with login/logout functionality",
    },
  },
  {
    id: "2",
    type: "time_off",
    title: "Time Off Request: Vacation",
    description: "Requesting 5 days vacation leave",
    requestedBy: {
      id: "user2",
      name: "Jane Smith",
    },
    requestedAt: "2024-01-09T14:30:00Z",
    status: "pending",
    priority: "medium",
    details: {
      startDate: "2024-01-20",
      endDate: "2024-01-24",
      reason: "Family vacation",
      days: 5,
    },
  },
  {
    id: "3",
    type: "expense",
    title: "Expense Reimbursement: Software License",
    description: "Reimbursement for design software license",
    requestedBy: {
      id: "user3",
      name: "Bob Johnson",
    },
    requestedAt: "2024-01-08T09:15:00Z",
    status: "approved",
    priority: "low",
    details: {
      amount: 299.99,
      category: "Software",
      receipt: "receipt_123.pdf",
    },
  },
];

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setApprovals(mockApprovals);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleApproval = (id: string, status: "approved" | "rejected") => {
    setApprovals((prev) =>
      prev.map((approval) =>
        approval.id === id ? { ...approval, status } : approval
      )
    );
  };

  // New function to handle bulk approval by userId
  const handleBulkApproval = (
    userId: string,
    status: "approved" | "rejected"
  ) => {
    setApprovals((prev) =>
      prev.map((approval) =>
        approval.requestedBy.id === userId && approval.status === "pending"
          ? { ...approval, status }
          : approval
      )
    );
  };

  // Get unique user IDs from pending approvals  
  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const processedApprovals = approvals.filter((a) => a.status !== "pending");

  // Generate filter groups for approvals
  const approvalFilterGroups = useMemo(() => {
    const typeOptions = Array.from(new Set(approvals.map(approval => approval.type)))
      .map(type => ({
        label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: type,
        count: approvals.filter(approval => approval.type === type).length
      }));

    const priorityOptions = Array.from(new Set(approvals.map(approval => approval.priority)))
      .map(priority => ({
        label: priority.charAt(0).toUpperCase() + priority.slice(1),
        value: priority,
        count: approvals.filter(approval => approval.priority === priority).length
      }));

    const statusOptions = Array.from(new Set(approvals.map(approval => approval.status)))
      .map(status => ({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
        count: approvals.filter(approval => approval.status === status).length
      }));

    return [
      {
        id: "type",
        label: "Type",
        options: typeOptions,
        type: "multiple" as const
      },
      {
        id: "priority",
        label: "Priority",
        options: priorityOptions,
        type: "multiple" as const
      },
      {
        id: "status",
        label: "Status",
        options: statusOptions,
        type: "multiple" as const
      }
    ].filter(group => group.options.length > 0);
  }, [approvals]);

  // Generate search suggestions for approvals
  const approvalSearchSuggestions = useMemo(() => {
    const suggestions = new Set<{ value: string; category?: string }>();

    approvals.forEach(approval => {
      suggestions.add({ value: approval.title, category: "Title" });
      suggestions.add({ value: approval.requestedBy.name, category: "Requester" });
      suggestions.add({ value: approval.type.replace('_', ' '), category: "Type" });
    });

    return Array.from(suggestions);
  }, [approvals]);

  // Apply search and filters to approvals
  const filteredApprovals = useMemo(() => {
    let filtered = approvals;

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(approval => 
        approval.title.toLowerCase().includes(searchLower) ||
        approval.description.toLowerCase().includes(searchLower) ||
        approval.requestedBy.name.toLowerCase().includes(searchLower) ||
        approval.type.toLowerCase().includes(searchLower)
      );
    }

    // Apply selected filters
    Object.entries(selectedFilters).forEach(([filterType, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(approval => {
          switch (filterType) {
            case "type":
              return values.includes(approval.type);
            case "priority":
              return values.includes(approval.priority);
            case "status":
              return values.includes(approval.status);
            default:
              return true;
          }
        });
      }
    });

    return filtered;
  }, [approvals, searchQuery, selectedFilters]);

  // Update pending and processed approvals to use filtered results
  const filteredPendingApprovals = filteredApprovals.filter((a) => a.status === "pending");
  const filteredProcessedApprovals = filteredApprovals.filter((a) => a.status !== "pending");

  // Get unique users with pending approvals (based on filtered results)
  const usersWithPendingApprovals = Array.from(
    new Set(filteredPendingApprovals.map((approval) => approval.requestedBy.id))
  ).map((userId) => {
    const userApproval = filteredPendingApprovals.find(
      (a) => a.requestedBy.id === userId
    );
    return {
      id: userId,
      name: userApproval?.requestedBy.name || "",
      count: filteredPendingApprovals.filter((a) => a.requestedBy.id === userId).length,
    };
  });

  // Apply user filter if selected
  const finalPendingApprovals = selectedUserId
    ? filteredPendingApprovals.filter((a) => a.requestedBy.id === selectedUserId)
    : filteredPendingApprovals;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task_completion":
        return <Check className="h-4 w-4" />;
      case "time_off":
        return <Clock className="h-4 w-4" />;
      case "expense":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task_completion":
        return "bg-green-100 text-green-800";
      case "time_off":
        return "bg-blue-100 text-blue-800";
      case "expense":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Phê duyệt</h1>
        <p className="text-muted-foreground">
          Xem xét và phê duyệt yêu cầu của nhóm
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Đang chờ phê duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Đã phê duyệt hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedApprovals.filter((a) => a.status === "approved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ưu tiên cao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingApprovals.filter((a) => a.priority === "high").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <SearchWithSuggestions
            placeholder="Tìm kiếm phê duyệt..."
            value={searchQuery}
            onChange={setSearchQuery}
            suggestions={approvalSearchSuggestions}
          />
        </div>
        <FilterDropdown
          groups={approvalFilterGroups}
          selectedFilters={selectedFilters}
          onFiltersChange={setSelectedFilters}
        />
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">              Đang chờ phê duyệt ({filteredPendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="processed">              Đã xử lý ({filteredProcessedApprovals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {/* User filter and bulk approval */}
          {usersWithPendingApprovals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Lọc theo nhân viên
                </CardTitle>
                <CardDescription>
                  Xem và phê duyệt yêu cầu theo nhân viên
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-start">
                  <div className="w-full sm:w-64">
                    <Select
                      value={selectedUserId || "all"}
                      onValueChange={(value) =>
                        setSelectedUserId(value === "all" ? null : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn một nhân viên" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả nhân viên</SelectItem>
                        {usersWithPendingApprovals.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedUserId && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() =>
                          handleBulkApproval(selectedUserId, "approved")
                        }
                        className="flex-1"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Phê duyệt tất cả ({filteredPendingApprovals.length})
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleBulkApproval(selectedUserId, "rejected")
                        }
                        className="flex-1"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Từ chối tất cả
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approval cards */}
          {finalPendingApprovals.map((approval) => (
            <Card key={approval.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={approval.requestedBy.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback className="text-xs">
                        {approval.requestedBy.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {approval.title}
                      </CardTitle>
                      <CardDescription>
                        Requested by {approval.requestedBy.name} •{" "}
                        {format(
                          new Date(approval.requestedAt),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(approval.type)}>
                      {getTypeIcon(approval.type)}
                      <span className="ml-1 capitalize">
                        {approval.type.replace("_", " ")}
                      </span>
                    </Badge>
                    <Badge className={getPriorityColor(approval.priority)}>
                      {approval.priority.charAt(0).toUpperCase() +
                        approval.priority.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{approval.description}</p>

                {/* Type-specific details */}
                {approval.type === "task_completion" && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Số giờ đã ghi:</strong>{" "}
                      {approval.details.hoursLogged}
                    </p>
                    <p className="text-sm mt-1">
                      <strong>Ghi chú:</strong> {approval.details.completionNotes}
                    </p>
                  </div>
                )}

                {approval.type === "time_off" && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Thời gian:</strong> {approval.details.days} ngày
                    </p>
                    <p className="text-sm">
                      <strong>Ngày:</strong> {approval.details.startDate} đến{" "}
                      {approval.details.endDate}
                    </p>
                    <p className="text-sm">
                      <strong>Lý do:</strong> {approval.details.reason}
                    </p>
                  </div>
                )}

                {approval.type === "expense" && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Số tiền:</strong> ${approval.details.amount}
                    </p>
                    <p className="text-sm">
                      <strong>Danh mục:</strong> {approval.details.category}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproval(approval.id, "approved")}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Phê duyệt
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleApproval(approval.id, "rejected")}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Từ chối
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {finalPendingApprovals.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Không có yêu cầu phê duyệt nào đang chờ</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          {filteredProcessedApprovals.map((approval) => (
            <Card key={approval.id} className="opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={approval.requestedBy.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback className="text-xs">
                        {approval.requestedBy.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {approval.title}
                      </CardTitle>
                      <CardDescription>
                        {approval.requestedBy.name} •{" "}
                        {format(new Date(approval.requestedAt), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={
                      approval.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {approval.status.charAt(0).toUpperCase() +
                      approval.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
