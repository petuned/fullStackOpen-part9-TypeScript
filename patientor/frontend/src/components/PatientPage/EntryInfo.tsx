import { Container, Typography } from "@mui/material";
import { Diagnosis, Entry } from "../../types";
import { LocalHospitalOutlined } from "@mui/icons-material";
import { CheckCircleOutline } from "@mui/icons-material";
import { Work } from "@mui/icons-material";

interface Props {
  entry: Entry;
  diagnoses: Diagnosis[];
}

const EntryInfo = ({ entry, diagnoses }: Props) => {
  const getDiagnoses = (code: string, index: number) => {
    const found = diagnoses.filter((d) => d.code === code);

    if (found.length === 0) {
      return null;
    }
    return (
      <Typography component="li" key={index}>
        {found[0].code} {found[0].name}
      </Typography>
    );
  };

  const assertNever = (value: never): never => {
    throw new Error(
      `Unhandled discriminated union member: ${JSON.stringify(value)}`
    );
  };

  const getEntryType = () => {
    switch (entry.type) {
      case "OccupationalHealthcare":
        return (
          <>
            <Typography variant="body1" style={{ marginBottom: "0.5em" }}>
              <Work />
              Occupational: {entry.employerName}
            </Typography>
            {entry.sickLeave ? (
              <Typography variant="body1" style={{ marginBottom: "0.5em" }}>
                Sick leave: from <i>{entry.sickLeave.startDate}</i> to{" "}
                <i>{entry.sickLeave.endDate}</i>{" "}
              </Typography>
            ) : null}
          </>
        );
      case "Hospital":
        return (
          <>
            <Typography variant="body1" style={{ marginBottom: "0.5em" }}>
              <LocalHospitalOutlined />
              Hospital
            </Typography>
            <Typography variant="body1" style={{ marginBottom: "0.5em" }}>
              Discharged: {entry.discharge.criteria} ({entry.discharge.date})
            </Typography>
          </>
        );
      case "HealthCheck":
        return (
          <>
            <Typography variant="body1" style={{ marginBottom: "0.5em" }}>
              <CheckCircleOutline />
              Health check
            </Typography>
            <Typography variant="body1" style={{ marginBottom: "0.5em" }}>
              Health check rating: {entry.healthCheckRating}
            </Typography>
          </>
        );
      default:
        return assertNever(entry);
    }
  };

  return (
    <Container
      style={{
        marginTop: "1em",
        paddingTop: "1em",
        paddingBottom: "1em",
        border: "solid",
        borderRadius: "1em"
      }}
    >
      <Typography variant="body1" style={{ marginBottom: "0.5em" }}>
        {entry.date} <i>{entry.description}</i>
      </Typography>
      {getEntryType()}
      <Typography component="ul">
        {entry.diagnosisCodes?.map((diagnose, index) =>
          getDiagnoses(diagnose, index)
        )}
      </Typography>
      <Typography variant="body1" style={{ marginTop: "0.5em" }}>
        Specialist: <i>{entry.specialist}</i>
      </Typography>
    </Container>
  );
};

export default EntryInfo;
