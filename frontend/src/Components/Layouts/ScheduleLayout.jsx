import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function ScheduleLayout({ classes, weekDates, timeSlots, renderCellContent }) {
  return (
    <TableContainer component={Paper} elevation={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Day</TableCell>
            {timeSlots.map((timeSlot) => (
              <TableCell key={timeSlot} align="center">{timeSlot}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {weekDates.map((date) => (
            <TableRow key={date.toString()}>
              <TableCell>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}<br />
                {date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
              </TableCell>
              {timeSlots.map((timeSlot) => (
                <TableCell key={`${date}-${timeSlot}`} align="center">
                  {renderCellContent(date, timeSlot, classes)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ScheduleLayout;