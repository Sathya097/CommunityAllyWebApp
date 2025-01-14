﻿namespace Ally
{
    /**
     * The controller for the page to track group spending
     */
    export class DateRangePickerController implements ng.IController
    {
        static $inject = ["appCacheService", "$scope", "$timeout"];

        filterPresetDateRange: string = "custom";
        startDate: Date;
        endDate: Date;
        shouldSuppressCustom: boolean = false;
        onChange: () => void;
        thisYearLabel: string;
        lastYearLabel: string;


        /**
        * The constructor for the class
        */
        constructor( private appCacheService: AppCacheService,
            private $scope: ng.IScope,
            private $timeout: ng.ITimeoutService )
        {
            this.thisYearLabel = new Date().getFullYear().toString();
            this.lastYearLabel = (new Date().getFullYear() - 1).toString();
        }


        /**
        * Called on each controller after all the controllers on an element have been constructed
        */
        $onInit()
        {
            if( !this.startDate && !this.endDate )
                this.selectPresetDateRange( true );

            this.$scope.$watch( "$ctrl.startDate", (newValue: Date, oldValue: Date) =>
            {
                if( !newValue || newValue === oldValue || this.shouldSuppressCustom )
                    return;

                this.filterPresetDateRange = "custom";
            } );
            this.$scope.$watch( "$ctrl.endDate", ( newValue: Date, oldValue: Date) =>
            {
                if( !newValue || newValue === oldValue || this.shouldSuppressCustom )
                    return;

                this.filterPresetDateRange = "custom";
            } );
        }


        selectPresetDateRange( suppressRefresh: boolean = false )
        {
            if( this.filterPresetDateRange === "last30days" )
            {
                this.startDate = moment().subtract( 30, 'days' ).toDate();
                this.endDate = moment().toDate();
            }
            else if( this.filterPresetDateRange === "thisMonth" )
            {
                this.startDate = moment().startOf( 'month' ).toDate();
                this.endDate = moment().endOf( 'month' ).toDate();
            }
            else if( this.filterPresetDateRange === "lastMonth" )
            {
                var lastMonth = moment().subtract( 1, 'months' );
                this.startDate = lastMonth.startOf( 'month' ).toDate();
                this.endDate = lastMonth.endOf( 'month' ).toDate();
            }
            else if( this.filterPresetDateRange === "thisYear" )
            {
                this.startDate = moment().startOf( 'year' ).toDate();
                this.endDate = moment().endOf( 'year' ).toDate();
            }
            else if( this.filterPresetDateRange === "lastYear" )
            {
                var lastYear = moment().subtract( 1, 'years' );
                this.startDate = lastYear.startOf( 'year' ).toDate();
                this.endDate = lastYear.endOf( 'year' ).toDate();
            }
            else if( this.filterPresetDateRange === "oneYear" )
            {
                this.startDate = moment().subtract( 1, 'years' ).toDate();
                this.endDate = moment().toDate();
            }

            // To prevent the dumb $watch from clearing our preselect label
            this.shouldSuppressCustom = true;
            window.setTimeout( () => this.shouldSuppressCustom = false, 25 );

            if( !suppressRefresh && this.onChange )
                window.setTimeout( () => this.onChange(), 50 ); // Delay a bit to let Angular's digests run on the bound dates
        }

        onInternalChange(suppressChangeEvent: boolean = false)
        {
            // Only call the change function if both strings are valid dates
            if( typeof this.startDate === "string" )
            {
                if( ( <string>this.startDate ).length !== 10 )
                    return;
                this.startDate = moment( <string>this.startDate, "MM-DD-YYYY" ).toDate();
            }

            if( typeof this.endDate === "string" )
            {
                if( ( <string>this.endDate ).length !== 10 )
                    return;
                this.endDate = moment( <string>this.endDate, "MM-DD-YYYY" ).toDate();
            }

            if( !suppressChangeEvent )
            {
                // Delay just a touch to let the model update
                this.$timeout( () =>
                {
                    if( this.onChange )
                        this.onChange();
                }, 10 );
            }
        }
    }
}


CA.angularApp.component( "dateRangePicker", {
    bindings: {
        startDate: "=",
        endDate: "=",
        onChange: "&"
    },
    templateUrl: "/ngApp/common/date-range-picker.html",
    controller: Ally.DateRangePickerController
} );