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
import { Diagnosis, EntryWithoutId, HealthCheckRating } from "../../types";
import { Link } from "react-router-dom";

interface Props {
  addEntry(entry: EntryWithoutId): void;
  diagnoses: Diagnosis[];
}

const EntryForm = ({ addEntry, diagnoses }: Props) => {
  const [entryType, setEntryType] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Dayjs | null>(dayjs(Date.now()));
  const [specialist, setSpecialist] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
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

  const getEntryDetails = (): EntryWithoutId => {
    const entry = {
      description: description,
      date: dayjs(date).format("YYYY-MM-DD"),
      specialist: specialist,
      diagnosisCodes: codes
    };
    switch (entryType) {
      case "Hospital":
        return {
          ...entry,
          type: entryType,
          discharge: {
            date: dayjs(dischargeDate).format("YYYY-MM-DD"),
            criteria: criteria
          }
        };
      case "OccupationalHealthcare":
        if (startDate && endDate) {
          return {
            ...entry,
            type: entryType,
            employerName: employer,
            sickLeave: {
              startDate: dayjs(startDate).format("YYYY-MM-DD"),
              endDate: dayjs(endDate).format("YYYY-MM-DD")
            }
          };
        } else {
          return {
            ...entry,
            type: entryType,
            employerName: employer
          };
        }
      case "HealthCheck":
        return {
          ...entry,
          type: entryType,
          healthCheckRating: rating
        };
      default:
        throw new Error("Unknown entry type");
    }
  };

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    const fullEntry = getEntryDetails();
    addEntry(fullEntry);
  };

  const getTypeInputs = () => {
    switch (entryType) {
      case "Hospital":
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
      case "OccupationalHealthcare":
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
      case "HealthCheck":
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
        <InputLabel id="entry-type-select">Entry type *</InputLabel>
        <Select
          value={entryType}
          onChange={(e) => setEntryType(e.target.value)}
          style={{ minWidth: "20%" }}
          required
        >
          <MenuItem value={"Hospital"}>Hospital</MenuItem>
          <MenuItem value={"OccupationalHealthcare"}>Occupational</MenuItem>
          <MenuItem value={"HealthCheck"}>Health check</MenuItem>
        </Select>
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
        <InputLabel id="entry-type-select">Diagnoses</InputLabel>
        <Select
          multiple
          value={codes}
          label="Diagnoses"
          onChange={({ target }) =>
            setCodes(
              typeof target.value === "string"
                ? target.value.split(",")
                : target.value
            )
          }
        >
          {diagnoses.map((diagnosis) => (
            <MenuItem key={diagnosis.code} value={diagnosis.code}>
              {diagnosis.code} {diagnosis.name}
            </MenuItem>
          ))}
        </Select>
        {getTypeInputs()}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Link to="/">
            <Button color="secondary" variant="contained" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="contained">
            Add
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default EntryForm;
