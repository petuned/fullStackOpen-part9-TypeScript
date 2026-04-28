import {
  Box,
  Button,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { SyntheticEvent, useState } from "react";
import { EntryWithoutId, HealthCheckRating } from "../../types";

interface Props {
  entryType: string;
  addEntry(entry: EntryWithoutId): void;
}

const EntryForm = ({ entryType, addEntry }: Props) => {
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Dayjs | null>(dayjs(Date.now()));
  const [specialist, setSpecialist] = useState("");
  const [codes, setCodes] = useState("");
  const [rating, setRating] = useState<HealthCheckRating>(HealthCheckRating.Healthy);
  const [dischargeDate, setDischargeDate] = useState<Dayjs | null>(
    dayjs(Date.now())
  );
  const [criteria, setCriteria] = useState("");
  const [employer, setEmployer] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const handleRatingChange = (e: SelectChangeEvent<HealthCheckRating>) => {
    e.preventDefault();
    setRating(Number(e.target.value));
  };

  const getEntryDetails = () => {
    const entry = {
      description: description,
      date: dayjs(date).format("YYYY-MM-DD"),
      specialist: specialist,
      diagnosisCodes: codes?.split(",")
    };
    switch (entryType) {
      case "hospital":
        return {
          ...entry,
          type: "Hospital",
          discharge: {
            date: dayjs(dischargeDate).format("YYYY-MM-DD"),
            criteria: criteria
          }
        };
      case "occupational":
        if (startDate && endDate) {
          return {
            ...entry,
            type: "OccupationalHealthcare",
            employerName: employer,
            sickLeave: {
              startDate: dayjs(startDate).format("YYYY-MM-DD"),
              endDate: dayjs(endDate).format("YYYY-MM-DD")
            }
          };
        } else {
          return {
            ...entry,
            type: "OccupationalHealthcare",
            employerName: employer
          };
        }
      case "healthCheck":
        return {
          ...entry,
          type: "HealthCheck",
          healthCheckRating: rating
        };
      default:
        throw new Error("Unknown entry type");
    }
  };

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();

    const fullEntry = getEntryDetails();
    console.log("Koko entry: ", fullEntry);
    addEntry(fullEntry);
  };

  const getTypeInputs = () => {
    switch (entryType) {
      case "hospital":
        return (
          <>
            <InputLabel style={{ marginTop: 20 }}>Discharge:</InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={dischargeDate}
                onChange={(newValue) => setDischargeDate(newValue)}
                label="Discharge date"
              />
            </LocalizationProvider>
            <TextField
              label="Criteria"
              fullWidth
              required
              value={criteria}
              onChange={({ target }) => setCriteria(target.value)}
            />
          </>
        );
      case "occupational":
        return (
          <>
            <TextField
              label="Employer"
              fullWidth
              required
              value={employer}
              onChange={({ target }) => setEmployer(target.value)}
            />
            <InputLabel style={{ marginTop: 20 }}>Sick leave:</InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                label="Start date"
              />
              <DatePicker
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                label="End date"
              />
            </LocalizationProvider>
          </>
        );
      case "healthCheck":
        return (
          <>
            <InputLabel style={{ marginTop: 20 }}>Health rating</InputLabel>
            <Select<HealthCheckRating>
              fullWidth
              required
              value={rating}
              label="Health rating"
              onChange={handleRatingChange}
            >
              <MenuItem value={HealthCheckRating.Healthy}>Healthy</MenuItem>
              <MenuItem value={HealthCheckRating.LowRisk}>Low risk</MenuItem>
              <MenuItem value={HealthCheckRating.HighRisk}>High risk</MenuItem>
              <MenuItem value={HealthCheckRating.CriticalRisk}>
                Critical risk
              </MenuItem>
            </Select>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Typography variant="h5" style={{ margin: "0.5em" }}>
        New entry
      </Typography>
      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: "60%"
        }}
        onSubmit={handleSubmit}
      >
        <TextField
          label="Description"
          fullWidth
          required
          value={description}
          onChange={({ target }) => setDescription(target.value)}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={date}
            onChange={(newValue) => setDate(newValue)}
            label="Date of entry"
          />
        </LocalizationProvider>
        <TextField
          label="Specialist name"
          fullWidth
          required
          value={specialist}
          onChange={({ target }) => setSpecialist(target.value)}
        />
        <TextField
          label="Diagnoses codes, separated by comma"
          fullWidth
          value={codes}
          onChange={({ target }) => setCodes(target.value)}
        />
        {getTypeInputs()}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button color="secondary" variant="contained" type="button">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Add
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default EntryForm;
