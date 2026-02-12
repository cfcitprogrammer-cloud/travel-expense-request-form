import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Separator } from "../ui/separator";
import { LayoutGrid, Table2, Trash2 } from "lucide-react";
import axios from "axios";
import { Spinner } from "../ui/spinner";
import { ButtonGroup } from "../ui/button-group";

interface Expense {
  type: string;
  amount: number;
}

interface DayExpenses {
  date: string;
  location: string;
  items: Record<string, Expense>;
}

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const EXPENSE_TYPES = [
  { value: "breakfast", label: "BREAKFAST (Out base only)" },
  { value: "lunch", label: "LUNCH" },
  { value: "dinner", label: "DINNER" },
  { value: "gasoline", label: "GASOLINE" },
  { value: "liters", label: "LITERS" },
  { value: "actual_km", label: "ACTUAL KILOMETERS VISE VERSA" },
  { value: "accommodation", label: "ACCOMMODATION (Out base only)" },
  { value: "parking", label: "PARKING" },
  { value: "toll_fee", label: "TOLL FEE/PASSWAY" },
  { value: "other_transpo", label: "*OTHER TRANSPO (Vulcanized)" },
  { value: "land_fare", label: "LAND FARE" },
  { value: "air_fare", label: "AIR FARE" },
  {
    value: "boat_fare",
    label: "BOAT FARE//ENVIRONMENTAL FEE//TERMINAL FEE",
  },
  { value: "communication", label: "COMMUNICATION" },
  { value: "courier", label: "COURIER" },
  { value: "others_sampling", label: "OTHERS-SAMPLING GIRL" },
];

const EXPENSE_LABEL_MAP = Object.fromEntries(
  EXPENSE_TYPES.map((e) => [e.value, e.label]),
);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);

export default function ApplicationPage() {
  // New fields
  const [employeeName, setEmployeeName] = useState("");
  const [position, setPosition] = useState("");
  const [purpose, setPurpose] = useState("");

  const [startDate, setStartDate] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [location, setLocation] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);

  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const [expensesByDay, setExpensesByDay] = useState<
    Record<string, DayExpenses>
  >({});

  // Submit the form
  const handleSubmit = async () => {
    if (!employeeName || !position || !purpose || !startDate) {
      alert("Please complete all required fields before submitting.");
      return;
    }

    // Check if all days have location
    const missingLocationDays = generatedWeek.filter(
      ({ key }) => !expensesByDay[key]?.location,
    );

    if (missingLocationDays.length > 0) {
      alert(
        `Please enter location for all days. Missing for: ${missingLocationDays
          .map((d) => d.label)
          .join(", ")}`,
      );
      return;
    }

    // Also check if at least one expense is added
    if (
      Object.values(expensesByDay).every(
        (day) => !day.items || Object.keys(day.items).length === 0,
      )
    ) {
      alert("Please add at least one expense before submitting.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        employeeName,
        position,
        purpose,
        startDate,
        expenses: expensesByDay,
        grandTotal,
      };

      console.log(payload);

      const res = await axios.post(
        "https://script.google.com/macros/s/AKfycbxNr5ofw0u3glqe1oE9-gAqLIGf32A6zo3BX8_VF7vwDbgprxHMQjPUwgg5V6pi26E/exec",
        JSON.stringify(payload),
      );

      if (res.status === 200) {
        alert("Form submitted successfully!");
        handleClearAll();
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error: any) {
      console.error(error);
      alert("Error submitting form: " + (error?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Clear all fields and expenses
  const handleClearAll = () => {
    setEmployeeName("");
    setPosition("");
    setPurpose("");
    setStartDate("");
    setSelectedDay("");
    setLocation("");
    setExpenseType("");
    setAmount("");
    setExpensesByDay({});
  };

  // Monday-only validation
  const handleStartDateChange = (value: string) => {
    const date = new Date(value);
    if (date.getDay() !== 1) {
      alert("Start date must be a Monday.");
      return;
    }
    setStartDate(value);
    setExpensesByDay({});
    setSelectedDay("");
    setLocation("");
  };

  // Generate full week
  const generatedWeek = useMemo(() => {
    if (!startDate) return [];

    const base = new Date(startDate);

    return DAYS.map((day, index) => {
      const newDate = new Date(base);
      newDate.setDate(base.getDate() + index);

      return {
        key: day,
        label: `${day.toUpperCase()} - ${newDate.toLocaleDateString()}`,
        iso: newDate.toISOString(),
      };
    });
  }, [startDate]);

  // Detect existing day
  const existingDayData = selectedDay ? expensesByDay[selectedDay] : undefined;

  const isExistingDayWithLocation = !!existingDayData?.location;

  const handleAdd = () => {
    if (
      !employeeName ||
      !position ||
      !purpose ||
      !selectedDay ||
      !expenseType ||
      !amount ||
      (!existingDayData?.location && !location)
    ) {
      alert("Please complete all required fields before adding an expense.");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      alert("Amount must be numeric.");
      return;
    }

    const dayInfo = generatedWeek.find((d) => d.key === selectedDay);
    if (!dayInfo) return;

    const finalLocation = existingDayData?.location || location;

    setExpensesByDay((prev) => {
      const existing = prev[selectedDay];

      return {
        ...prev,
        [selectedDay]: {
          date: dayInfo.label,
          location: finalLocation,
          items: {
            ...(existing?.items || {}),
            [expenseType]: {
              type: expenseType,
              amount: numericAmount,
            },
          },
        },
      };
    });

    setExpenseType("");
    setAmount("");

    if (!existingDayData) {
      setLocation("");
    }
  };

  const deleteExpense = (dayKey: string, type: string) => {
    setExpensesByDay((prev) => {
      const updated = { ...prev };

      delete updated[dayKey].items[type];

      if (Object.keys(updated[dayKey].items).length === 0) {
        delete updated[dayKey];
      }

      return updated;
    });
  };

  const deleteDay = (dayKey: string) => {
    setExpensesByDay((prev) => {
      const updated = { ...prev };
      delete updated[dayKey];
      return updated;
    });
  };

  const dayTotal = (items: Record<string, Expense>) =>
    Object.values(items).reduce((sum, item) => sum + item.amount, 0);

  const grandTotal = Object.values(expensesByDay).reduce(
    (sum, day) => sum + dayTotal(day.items),
    0,
  );

  return (
    <div className="p-1 space-y-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
      <div className="bg-amber-400 p-2 col-span-full">
        <h1 className="text-sm lg:text-2xl font-bold ">
          TRAVEL EXPENSE REQUEST FORM
        </h1>
      </div>

      {/* Employee Details */}
      <div>
        <Label>Employee Name</Label>
        <Input
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
        />
      </div>
      <div>
        <Label>Position</Label>
        <Input value={position} onChange={(e) => setPosition(e.target.value)} />
      </div>
      <div>
        <Label>Purpose</Label>
        <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} />
      </div>

      {/* Start Date */}
      <div>
        <Label>Start Date (Must be Monday)</Label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
        />
      </div>

      <Separator className="col-span-full" />

      {startDate && (
        <>
          {/* Day Select */}
          <div>
            <Label>Select Day</Label>
            <Select onValueChange={setSelectedDay} value={selectedDay}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {generatedWeek.map((d) => (
                    <SelectItem key={d.key} value={d.key}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Location - Hidden if already set */}
          {!isExistingDayWithLocation && (
            <div>
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value.toUpperCase())}
                placeholder="Enter Location"
                className="uppercase"
              />
            </div>
          )}

          {/* Expense Type */}
          <div>
            <Label>Expense Type</Label>
            <Select onValueChange={setExpenseType} value={expenseType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Expense" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {EXPENSE_TYPES.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div>
            <Label>Amount</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="col-span-full">
            <Button onClick={handleAdd} className="mt-6 w-full">
              Add/Update Expense
            </Button>
          </div>

          <Separator className="col-span-full" />

          {/* Summary Table */}
          {Object.keys(expensesByDay).length > 0 && (
            <div className="col-span-full">
              <h2 className="text-lg font-semibold mt-6 bg-black text-white">
                Weekly Summary
              </h2>

              {/* Employee Info */}
              <div className="mt-2 mb-4 space-y-1 text-left text-sm">
                <div>
                  <strong>Employee:</strong> {employeeName || "-"}
                </div>
                <div>
                  <strong>Position:</strong> {position || "-"}
                </div>
                <div>
                  <strong>Purpose:</strong> {purpose || "-"}
                </div>
              </div>

              <ButtonGroup className="ml-auto">
                <Button
                  size="sm"
                  variant={viewMode === "table" ? "default" : "outline"}
                  onClick={() => setViewMode("table")}
                >
                  <Table2 />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "card" ? "default" : "outline"}
                  onClick={() => setViewMode("card")}
                >
                  <LayoutGrid />
                </Button>
              </ButtonGroup>

              {viewMode === "table" ? (
                <>
                  <Table className="mt-3 text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Expenses</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {generatedWeek.map(({ key, label }) => {
                        const dayData = expensesByDay[key];

                        return (
                          <TableRow key={key}>
                            <TableCell>{label}</TableCell>

                            <TableCell>
                              <Input
                                value={dayData?.location || ""}
                                placeholder="Enter location"
                                onChange={(e) => {
                                  const loc = e.target.value.toUpperCase();
                                  setExpensesByDay((prev) => ({
                                    ...prev,
                                    [key]: {
                                      date: label,
                                      location: loc,
                                      items: dayData?.items || {},
                                    },
                                  }));
                                }}
                                className="uppercase h-8 text-xs min-w-30"
                              />
                            </TableCell>

                            <TableCell className="space-y-1">
                              {dayData &&
                                Object.values(dayData.items).map((item) => (
                                  <div
                                    key={item.type}
                                    className="flex justify-between items-center gap-2"
                                  >
                                    <span>{EXPENSE_LABEL_MAP[item.type]}</span>
                                    <span>{formatCurrency(item.amount)}</span>
                                    <Button
                                      size="icon"
                                      variant="destructive"
                                      onClick={() =>
                                        deleteExpense(key, item.type)
                                      }
                                      className="h-6 w-6"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                            </TableCell>

                            <TableCell className="font-semibold">
                              {dayData
                                ? formatCurrency(dayTotal(dayData.items))
                                : formatCurrency(0)}
                            </TableCell>

                            <TableCell>
                              {dayData && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteDay(key)}
                                  className="h-7 text-xs"
                                >
                                  Delete
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="grid gap-4 mt-3">
                  {generatedWeek.map(({ key, label }) => {
                    const dayData = expensesByDay[key];

                    return (
                      <div
                        key={key}
                        className="border rounded-lg p-4 space-y-2 bg-white shadow-sm"
                      >
                        <div className="font-semibold text-sm">{label}</div>

                        <Input
                          value={dayData?.location || ""}
                          placeholder="Enter location"
                          onChange={(e) => {
                            const loc = e.target.value.toUpperCase();
                            setExpensesByDay((prev) => ({
                              ...prev,
                              [key]: {
                                date: label,
                                location: loc,
                                items: dayData?.items || {},
                              },
                            }));
                          }}
                          className="uppercase text-xs"
                        />

                        <div className="space-y-1">
                          {dayData &&
                            Object.values(dayData.items).map((item) => (
                              <div
                                key={item.type}
                                className="flex justify-between items-center text-xs"
                              >
                                <span>{EXPENSE_LABEL_MAP[item.type]}</span>
                                <span>{formatCurrency(item.amount)}</span>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => deleteExpense(key, item.type)}
                                  className="h-6 w-6"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                        </div>

                        <div className="font-bold text-right text-sm">
                          Total:{" "}
                          {dayData
                            ? formatCurrency(dayTotal(dayData.items))
                            : formatCurrency(0)}
                        </div>

                        {dayData && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteDay(key)}
                            className="w-full text-xs"
                          >
                            Delete Day
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="text-right font-bold mt-4 text-base">
                Grand Total: {formatCurrency(grandTotal)}
              </div>

              <div className="mt-2">
                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? <Spinner /> : "Submit Form"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
