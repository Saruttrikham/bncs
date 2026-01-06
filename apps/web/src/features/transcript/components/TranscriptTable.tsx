"use client";

import type { StandardizedTranscriptDto } from "@ncbs/dtos";

interface TranscriptTableProps {
  transcripts: StandardizedTranscriptDto[];
}

export function TranscriptTable({ transcripts }: TranscriptTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Course Code</th>
          <th>Course Name</th>
          <th>Credits</th>
          <th>Grade</th>
          <th>Semester</th>
          <th>Academic Year</th>
        </tr>
      </thead>
      <tbody>
        {transcripts.map((transcript) => (
          <tr key={transcript.id}>
            <td>{transcript.courseCode}</td>
            <td>{transcript.courseName}</td>
            <td>{transcript.credits}</td>
            <td>{transcript.grade}</td>
            <td>{transcript.semester}</td>
            <td>{transcript.academicYear}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
