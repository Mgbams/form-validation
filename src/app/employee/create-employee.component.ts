import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import {CustomValidators} from './../shared/custom.validators';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {
  employeeForm!: FormGroup;
  fullnameLength = 0;

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
    'skillName': '',
    'experienceInYears': '',
    'proficiency': ''
  };
  
  constructor(private fb: FormBuilder) { }

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
      email: ['', [Validators.required, CustomValidators.emailDomain('king.com')]],
      contactPreference: ['email'],
      phone: [''],
      skills: this.fb.group({
        skillName: ['', Validators.required],
        experienceInYears: ['', Validators.required],
        proficiency: ['', Validators.required]
      })
    });

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
    })

  }

  onSubmit(): void {
    console.log(this.employeeForm.value);
    console.log(this.employeeForm.controls.fullname.value);
    console.log(this.employeeForm.get('email')?.dirty);
    console.log(this.employeeForm.touched);
  }

  logValidationErrors(group: FormGroup = this.employeeForm): void {
    //console.log(Object.keys(group.controls));
    Object.keys(group.controls).forEach((key: string) => {
        const abstractControl = group.get(key);
        if(abstractControl instanceof FormGroup) {
          // Used to recursively call the function so it handles nested formgroup
          this.logValidationErrors(abstractControl);
          //abstractControl?.disable;// if i call it here, it disables only the controls in the nested form
        } else {
          //console.log('key = ' + key + " Value = " + abstractControl?.value);
         // abstractControl?.disable; // when used  here it disables all the controls in the form
         this.formErrors[key] = ''; // clear existing errors
         if(abstractControl && !abstractControl.valid && (abstractControl.touched || abstractControl.dirty)) {
           const messages = this.validationMessages[key];
           //console.log(messages);
           //console.log(abstractControl.errors);
           for (const errorKey in abstractControl.errors) {
             if(errorKey) {
               this.formErrors[key] += messages[errorKey] + ' ';
             }
           }
         }
        }
    })
  }

  onLoadDataClick(): void {
    this.logValidationErrors(this.employeeForm);
    console.log(this.formErrors);
    /* this.employeeForm.setValue({
      fullname: "kingsley",
      email: "k@gmail.com",
      skills: {
        skillName: "C#",
        experienceInYears: 5,
        proficiency: 'beginner'
      }
    }) */
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
