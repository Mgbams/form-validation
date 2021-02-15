import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {CustomValidators} from './../shared/custom.validators';
 import { EmployeeService } from "./employee.service";
 import { IEmployee } from "./IEmployee";
 import { ISkill } from "./ISkill";

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  fullnameLength = 0;
 // skills: FormArray;
  employee!: IEmployee;
  pageTitle: string = '';
 
  validationMessages: any = {
    'fullname': {
      'required': 'Full name is required.',
      'minlength': 'Full name must be greater than or equal to 2 characters.',
      'maxlength': 'Full name must be less than 10 characters'
    },
    'email': {
      'required': 'Email is required.',
      'emailDomain': 'Email domain should be king.com'
    },
     'confirmEmail': {
      'required': 'Confirm Email is required.'
    },
    'emailGroup': {
      'emailMisMatch': 'Email and confirmEmail do not match.'
    },
    'phone': {
      'required': 'Phone is required.'
    },
    'skillName': {
      'required': 'SkillName is required'
    },
    'experienceInYears': {
      'required': 'experience is required'
    },
    'proficiency': {
      'required': 'proficiency is required'
    }
  };

  formErrors: any = {
    'fullname': '',
    'email': '',
    'confirmEmail': '',
    'emailGroup': '',
    'skillName': '',
    'experienceInYears': '',
    'proficiency': ''
  };
  
  constructor(private fb: FormBuilder, 
    private route: ActivatedRoute, private _employeeService: EmployeeService,
    private _roter: Router
    ) { }

  ngOnInit(): void {
    // Using the first ReactiveForm approach
   /*  this.employeeForm = new FormGroup({
      fullname: new FormControl(),
      email: new FormControl(),
      //Skills as a nested formgroup
      skills: new FormGroup({
        skillName: new FormControl(),
        experienceInYears: new FormControl(),
        proficiency: new FormControl()
      })
    }) */

    // Using FormBuilder approach
    this.employeeForm = this.fb.group({
      fullname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(9)]],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, CustomValidators.emailDomain('king.com')]],
        confirmEmail: ['', Validators.required],
      }, {validator: matchEmail}),
      contactPreference: ['email'],
      phone: [''],
     /*  skills: this.fb.group({
        skillName: ['', Validators.required],
        experienceInYears: ['', Validators.required],
        proficiency: ['', Validators.required]
      }) */
      skills: this.fb.array([
        this.addSkillFormFroup()
      ])
    });
     
    //this.skills = this.employeeForm.get('skills') as FormArray;
    
    
    this.employeeForm.get("fullname")?.valueChanges.subscribe(
      (value: string) => {
        //console.log(value);
        this.fullnameLength = value.length;
      }
    );

    // This monitors the changes to contactPreference fields of either email or phone 
    this.employeeForm.get('contactPreference')?.valueChanges.subscribe((data: string) => {
      this.onContactPreferenceChange(data);
    });

    this.employeeForm.valueChanges.subscribe((data) => {
      this.logValidationErrors(this.employeeForm);
    });

    this.route.paramMap.subscribe(params => {
      const empId = +params.get('id')!;

      if (empId) {
        this.pageTitle = 'Edit Employee';
        this.getEmployee(empId);
      } else {
        this.pageTitle = 'Create Employee';
        this.employee =  {
          id: null,
          fullname: '',
          contactPreference: '',
          email: '',
          phone: null,
          skills: []
        };
      }
    })

  }

 get skills() : FormArray {
    return this.employeeForm.get("skills") as FormArray;
  } 

  getEmployee(id: number) {
   this._employeeService.getEmployeeById(id).subscribe(
     (employee: IEmployee) => {
       this.editEmployee(employee);
       this.employee = employee
      },
     (error: any) => console.log(error)
   )
  }

  editEmployee(employee: IEmployee) {
    this.employeeForm.patchValue({
      fullname: employee.fullname,
      contactPreference: employee.contactPreference,
      emailGroup: {
        email: employee.email,
        confirmEmail: employee.email
      },
      phone: employee.phone
    });

    this.employeeForm.setControl('skills', this.setExistingSkills(employee.skills));
  }

  setExistingSkills(skillSets: ISkill[]): FormArray {
    //console.log(skillSets);
    const formArray = new FormArray([]);
    skillSets.forEach(s => {
      formArray.push(this.fb.group({
        skillName: s.skillName,
        experienceInYears: s.experienceInYears,
        proficiency: s.proficiency
      }))
    });
    //console.log(formArray);
    return formArray;
  }

  onSubmit(): void {
    /* console.log(this.employeeForm.value);
    console.log(this.employeeForm.controls.fullname.value);
    console.log(this.employeeForm.get('email')?.dirty);
    console.log(this.employeeForm.touched); */
    this.mapFormValuesToemployeeModel()
    if(this.employee.id) {
      this._employeeService.updateEmployee(this.employee).subscribe(
        () => this._roter.navigate(['list']),
        (error) => console.log(error)
      );
    } else {
       this._employeeService.addEmployee(this.employee).subscribe(
        () => this._roter.navigate(['list']),
        (error) => console.log(error)
      );
    }
  }

  mapFormValuesToemployeeModel() {
    this.employee.fullname          = this.employeeForm.value.fullname;
    this.employee.contactPreference = this.employeeForm.value.contactPreference;
    this.employee.email             = this.employeeForm.value.emailGroup.email;
    this.employee.phone             = this.employeeForm.value.phone;
    this.employee.skills            = this.employeeForm.value.skills;
  }

  addSkillButtonClick(): void {
    //console.log('yellow');
    (<FormArray>this.employeeForm.get('skills')).push(this.addSkillFormFroup());
  }

  addSkillFormFroup(): FormGroup {
   return this.fb.group({
        skillName: ['', Validators.required],
        experienceInYears: ['', Validators.required],
        proficiency: ['', Validators.required]
    });
  }

  removeSkillButtonClick(skillGroupIndex: number): void {
    const skillsFormArray = (<FormArray>this.employeeForm.get('skills'));
    skillsFormArray.removeAt(skillGroupIndex);
    skillsFormArray.markAllAsTouched();
    skillsFormArray.markAsDirty();
  }

  logValidationErrors(group: FormGroup = this.employeeForm): void {
    //console.log(Object.keys(group.controls));
    Object.keys(group.controls).forEach((key: string) => {
        const abstractControl = group.get(key);
         //console.log('key = ' + key + " Value = " + abstractControl?.value);
         // abstractControl?.disable; // when used  here it disables all the controls in the form
         this.formErrors[key] = ''; // clear existing errors
         if(abstractControl && !abstractControl.valid && 
          (abstractControl.touched || abstractControl.dirty || abstractControl.value !== '')) {
           const messages = this.validationMessages[key];
           //console.log(messages);
           //console.log(abstractControl.errors);
           for (const errorKey in abstractControl.errors) {
             if(errorKey) {
               this.formErrors[key] += messages[errorKey] + ' ';
             }
           }
         }

        if(abstractControl instanceof FormGroup) {
          // Used to recursively call the function so it handles nested formgroup
          this.logValidationErrors(abstractControl);
          //abstractControl?.disable;// if i call it here, it disables only the controls in the nested form
        } 

        //Used to check for FormArray
        if(abstractControl instanceof FormArray) {
          for (const control of abstractControl.controls) {
            if(control instanceof FormGroup) {
               this.logValidationErrors(control);
            }
          }
        } 
    })
  }

  onLoadDataClick(): void {
    // this.logValidationErrors(this.employeeForm);
    // console.log(this.formErrors);
    /* this.employeeForm.setValue({
      fullname: "kingsley",
      email: "k@gmail.com",
      skills: {
        skillName: "C#",
        experienceInYears: 5,
        proficiency: 'beginner'
      }
    }) */
    // First formArray approach
  /*   const formArray = new FormArray([
      new FormControl('john', Validators.required),
      new FormGroup({
        country: new FormControl('', Validators.required)
      }),
      new FormArray([])
    ]);

    for (const controls of formArray.controls) {
      if(controls instanceof FormControl) {
        console.log('control is FormControl');
      }
       if(controls instanceof FormGroup) {
        console.log('control is FormGroup');
      }
       if(controls instanceof FormArray) {
        console.log('control is FormArray');
      }
    } */

    // Second formArray approach: this will give output as array
    const formArray1 = this.fb.array([
      new FormControl('john', Validators.required),
       new FormControl('IT', Validators.required),
       new FormControl('', Validators.required),
    ]);
    //console.log(formArray1.value);
    formArray1.push(new FormControl('Mary', Validators.required));
    console.log(formArray1.at(3).value);
    //console.log(formArray.length);

    //Third formGroup approach: This will give output as object
   /*  const formGroup = this.fb.group([
      new FormControl('john', Validators.required),
       new FormControl('IT', Validators.required),
       new FormControl('', Validators.required),
    ]); */
  }

  onContactPreferenceChange(selectedValue: string) {
    const phoneControl = this.employeeForm.get('phone');
    if(selectedValue === 'phone') {
      phoneControl?.setValidators(Validators.required);
      //multiple validators can be set as shown below
      // phoneControl?.setValidators([Validators.required, Validators.maxLength(8)]);
    } else {
      phoneControl?.clearValidators();
    }

    phoneControl?.updateValueAndValidity(); // This triggers the form validation
  }

}

function matchEmail(group: AbstractControl): {[key: string]: any} | null {
     const emailControl = group.get('email'); 
     const confirmEmailControl = group.get('confirmEmail');
     
     if(emailControl?.value === confirmEmailControl?.value || 
      (confirmEmailControl?.pristine && confirmEmailControl.value === '')) {
       return null;
     } else {
       return {'emailMisMatch': true}
     }
}

