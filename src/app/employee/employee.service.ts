import { Injectable } from "@angular/core";
import { IEmployee } from "./IEmployee";
import {Observable, throwError, of} from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';

@Injectable()
export class EmployeeService {
  baseUrl = 'http://localhost:3000/employees';
  constructor(private httpClient: HttpClient) {}
    
    getEmployees(): Observable<IEmployee[]> {
        // To use the link at localhost:3000, make sure the fake api at that location is active by running
        // the below command in your terminal:  json-server --watch db.json
        return this.httpClient.get<IEmployee[]>(this.baseUrl)
                                 .pipe(catchError(this.handleError));
    }

    getEmployeeById(employeeId: number): Observable<IEmployee> {
       // return this.listEmployees.find(e => e.id === employeeId); // this is for array on client side
       return this.httpClient.get<IEmployee>(`${this.baseUrl}/${employeeId}`).pipe(catchError(this.handleError))
    }

    private handleError(errorResponse: HttpErrorResponse) {
      if(errorResponse.error instanceof ErrorEvent) {
        //Meaning it is a client side error or a network error
        console.error('Client side error', errorResponse.error.message);
      } else {
        //Meaning it is a server side error 
        console.error('Server side error', errorResponse);
      }
      
      return throwError("There is a problem with the service. We are notified and working on it. Please try again later!")
    }

    addEmployee(employee: IEmployee): Observable<IEmployee> {
        return this.httpClient.post<IEmployee>(this.baseUrl, employee, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        }).pipe(catchError(this.handleError))  
    }

    updateEmployee(employee: IEmployee): Observable<void> {
        return this.httpClient.put<void>(`${this.baseUrl}/${employee.id}`, employee, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        }).pipe(catchError(this.handleError))
    }

    delete(id: number): Observable<void> {
       return this.httpClient.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
    }
}