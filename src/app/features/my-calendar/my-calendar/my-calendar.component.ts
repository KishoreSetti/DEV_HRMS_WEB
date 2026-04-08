import { Component, OnInit } from '@angular/core';
import { CompanyEventsService } from '../../company-events/company-events.service';
import { AdminService } from '../../../admin/servies/admin.service';
import { EmployeeResignationService } from '../../employee-profile/employee-services/employee-resignation.service';

interface CalendarItem{
  date:string
  type:string
  title:string
  status?: string
}
@Component({
  selector: 'app-my-calendar',
  standalone: false,
  templateUrl: './my-calendar.component.html',
  styleUrl: './my-calendar.component.css'
})
export class MyCalendarComponent {
today=new Date()
currentMonth=this.today.getMonth()
currentYear=this.today.getFullYear()

weekDays=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

monthNames=[
'January','February','March','April','May','June',
'July','August','September','October','November','December'
]

    selectedEvent:any=null

    items:CalendarItem[]=[]

    /* Legend toggles */

    showAssets=true
    showExpenses=true
    showCompanyNews=true
    showPolicies=true
    showHelpdesk=true
    showPerformance=true
    showLeaves=true
    showTimesheet=true
    showProfile=true
    showBirthdays=true
    showAnniversary=true
    companyId!:number
    regionId!:number
    showWeekoff = true;
    showHoliday = true;
    constructor(private leaveService: EmployeeResignationService, private calendarService:CompanyEventsService, private adminService:AdminService){}

    ngOnInit(){

        const userId=Number(sessionStorage.getItem("UserId"))
        this.companyId=Number(sessionStorage.getItem("CompanyId"))
        this.regionId=Number(sessionStorage.getItem("RegionId"))
        // this.loadCalendar(userId)
        this.loadWeekoffs(this.companyId, this.regionId)
        this.loadHolidays(this.companyId, this.regionId)
        this.loadUserLeaves(userId) 
       
    }

loadUserLeaves(userId:number){

this.leaveService.getUserLeaves(userId).subscribe((res:any)=>{

const leaveItems:any[] = []

res.filter((x:any)=>x.status === 'Approved').forEach((x:any)=>{

const start = new Date(x.startDate)
const end = new Date(x.endDate)

for(let d = new Date(start); d <= end; d.setDate(d.getDate()+1)){

leaveItems.push({
date: d.toLocaleDateString('en-CA'),
type:'leave',
title:x.leaveTypeName,
status:x.status 
})

}

})

this.items = [...this.items, ...leaveItems]

})

}

    /* Month Navigation */

    previousMonth(){

    if(this.currentMonth===0){
    this.currentMonth=11
    this.currentYear--
    }else{
    this.currentMonth--
    }

    }

    nextMonth(){

    if(this.currentMonth===11){
    this.currentMonth=0
    this.currentYear++
    }else{
    this.currentMonth++
    }

    }
loadWeekoffs(companyId:number, regionId:number){

this.adminService.getWeekoffs(companyId,regionId).subscribe((res:any)=>{

const weekoffDays = res.data
  .filter((x:any)=>x.isActive && x.weekoffDate)   // ignore null
  .map((x:any)=>x.weekoffDate)

const calendarDays = this.getCalendarDays()

calendarDays.forEach((d:any)=>{

if(!d) return

const dayName = d.toLocaleDateString('en-US',{weekday:'long'})

if(weekoffDays.includes(dayName)){

this.items.push({
date:d.toLocaleDateString('en-CA'),
type:'weekoff',
title:'Weekoff'
})

}

})

})

}

// Get Holidays

isWeekoffDate(date:any){

if(!date) return false

const formatted = date.toLocaleDateString('en-CA')

return this.items.some(item => 
  item.date === formatted && item.type === 'weekoff'
)

}

loadHolidays(companyId:number, regionId:number){

this.adminService.getHolidays(companyId,regionId).subscribe((res:any)=>{

if(res && res.data){

const holidayItems = res.data
  .filter((x:any)=>x.isActive && x.date)
  .map((x:any)=>({
     date:x.date.split('T')[0],
      type: 'holiday',
      title: x.holidayListName
  }))

this.items = [...this.items, ...holidayItems]

}

})

}

    /* Calendar Days */

    getCalendarDays(){

const firstDay = new Date(this.currentYear,this.currentMonth,1)
const lastDay = new Date(this.currentYear,this.currentMonth+1,0)

const days:any[]=[]

// convert Sunday=0 to last position
let startDay = firstDay.getDay()
startDay = startDay === 0 ? 6 : startDay - 1

// empty cells before first date
for(let i=0;i<startDay;i++){
days.push(null)
}

// month days
for(let i=1;i<=lastDay.getDate();i++){
days.push(new Date(this.currentYear,this.currentMonth,i))
}

return days

}


  
    /* Event Filter */

    getItemsForDate(date:any){

    if(!date) return []

    const formatted=date.toLocaleDateString('en-CA')

    return this.items.filter(item=>{

    const matchDate=item.date===formatted

    const matchType=

    (item.type==='asset' && this.showAssets) ||
    (item.type==='expense' && this.showExpenses) ||
    (item.type==='companyNews' && this.showCompanyNews) ||
    (item.type==='policy' && this.showPolicies) ||
    (item.type==='helpdesk' && this.showHelpdesk) ||
    (item.type==='performance' && this.showPerformance) ||
    (item.type==='leave' && this.showLeaves) ||
    (item.type==='timesheet' && this.showTimesheet) ||
    (item.type==='profile' && this.showProfile) ||
    (item.type==='birthday' && this.showBirthdays) ||
    (item.type==='workAnniversary' && this.showAnniversary) ||
    (item.type==='weekoff' && this.showWeekoff)||
    (item.type==='holiday' && this.showHoliday) 

    return matchDate && matchType

    })

    }

    /* Weekend Check */

    isWeekend(date:any){

    if(!date) return false

    const day = date.getDay()

    return day === 0 || day === 6

    }

    /* Today Highlight */

    isToday(date:any){

    if(!date) return false

    return date.toDateString()===new Date().toDateString()

    }

    /* Popup */

    openEvent(item:any){
    this.selectedEvent=item
    }

    closePopup(){
    this.selectedEvent=null
    }
}
