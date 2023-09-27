import React from "react";

function CloseIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 7l10 10M7 17L17 7"/>
        </svg>
    )
}

function CheckIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill={color}>
                <path d="M10.243 16.314L6 12.07l1.414-1.414l2.829 2.828l5.656-5.657l1.415 1.415l-7.071 7.07Z"/>
                <path fillRule="evenodd" d="M1 12C1 5.925 5.925 1 12 1s11 4.925 11 11s-4.925 11-11 11S1 18.075 1 12Zm11 9a9 9 0 1 1 0-18a9 9 0 0 1 0 18Z" clipRule="evenodd"/>
            </g>
        </svg>
    )
}

function CancelIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zM2 10a8 8 0 0 1 1.69-4.9L14.9 16.31A8 8 0 0 1 2 10zm14.31 4.9L5.1 3.69A8 8 0 0 1 16.31 14.9z"/>
        </svg>
    )
}

function WarningIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill={color}>
                <path d="M12 14a1 1 0 0 1-1-1v-3a1 1 0 1 1 2 0v3a1 1 0 0 1-1 1zm-1.5 2.5a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0z"/>
                <path d="M10.23 3.216c.75-1.425 2.79-1.425 3.54 0l8.343 15.852C22.814 20.4 21.85 22 20.343 22H3.657c-1.505 0-2.47-1.6-1.77-2.931L10.23 3.216zM20.344 20L12 4.147L3.656 20h16.688z"/>
            </g>
        </svg>
    )
}

function ErrorIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} fillRule="evenodd" d="M8 14.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13ZM8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm1-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0Zm-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z" clipRule="evenodd"/>
        </svg>
    )
}

function MenuIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 17h8m-8-5h14m-8-5h8"/>
        </svg>
    )
}

function FeedIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M9 22c-.6 0-1-.4-1-1v-3H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-6.1l-3.7 3.7c-.2.2-.4.3-.7.3H9m1-6v3.1l3.1-3.1H20V4H4v12h6m6.3-10l-1.4 3H17v4h-4V8.8L14.3 6h2m-6 0L8.9 9H11v4H7V8.8L8.3 6h2Z"/>
        </svg>

    )
}

function CommunityIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="m2.5 8.86l9 5.2a1 1 0 0 0 1 0l9-5.2A1 1 0 0 0 22 8a1 1 0 0 0-.5-.87l-9-5.19a1 1 0 0 0-1 0l-9 5.19A1 1 0 0 0 2 8a1 1 0 0 0 .5.86ZM12 4l7 4l-7 4l-7-4Zm8.5 7.17L12 16l-8.5-4.87a1 1 0 0 0-1.37.37a1 1 0 0 0 .37 1.36l9 5.2a1 1 0 0 0 1 0l9-5.2a1 1 0 0 0 .37-1.36a1 1 0 0 0-1.37-.37Zm0 4L12 20l-8.5-4.87a1 1 0 0 0-1.37.37a1 1 0 0 0 .37 1.36l9 5.2a1 1 0 0 0 1 0l9-5.2a1 1 0 0 0 .37-1.36a1 1 0 0 0-1.37-.37Z"/>
        </svg>
    )
}

function NotificationIcon({color, dotColor, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill={color}>
                <path fill={dotColor} d="M20 7a3 3 0 1 1-6 0a3 3 0 0 1 6 0Z"/>
                <path d="M12 6H4v14h14v-8h-2v6H6V8h6V6Z"/>
            </g>
        </svg>
    )
}

function CreatePostIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5v2H5v14h14v-5h2z"/>
            <path fill={color} d="M21 7h-4V3h-2v4h-4v2h4v4h2V9h4z"/>
        </svg>
    )
}

function ChatIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M20 2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h16M4 4v13.17L5.17 16H20V4H4m2 3h12v2H6V7m0 4h9v2H6v-2Z"/>
        </svg>
    )
}

function DeleteIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 32 32">
            <path fill={color} d="M12 12h2v12h-2zm6 0h2v12h-2z"/>
            <path fill={color} d="M4 6v2h2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8h2V6zm4 22V8h16v20zm4-26h8v2h-8z"/>
        </svg>
    )
}

function ImageIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill={color} fillRule="evenodd" clipRule="evenodd">
                <path d="M7 7a3 3 0 1 0 0 6a3 3 0 0 0 0-6Zm-1 3a1 1 0 1 1 2 0a1 1 0 0 1-2 0Z"/>
                <path d="M3 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H3Zm18 2H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4.314l6.878-6.879a3 3 0 0 1 4.243 0L22 15.686V6a1 1 0 0 0-1-1Zm0 14H10.142l5.465-5.464a1 1 0 0 1 1.414 0l4.886 4.886A1 1 0 0 1 21 19Z"/>
            </g>
        </svg>   
    )
}

function VideoIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 48 48">
            <g fill="none" stroke={color} strokeLinejoin="round" strokeWidth="4">
                <path d="M4 10a2 2 0 0 1 2-2h36a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10Z"/>
                <path strokeLinecap="round" d="M36 8v32M12 8v32m26-22h6m-6 12h6M4 18h6m-6-2v4M9 8h6M9 40h6M33 8h6m-6 32h6M4 30h6m-6-2v4m40-4v4m0-16v4"/>
                <path d="m21 19l8 5l-8 5V19Z"/>
            </g>
        </svg>
    )
}

function LinkIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 20">
            <path fill={color} d="M9.26 13a2 2 0 0 1 .01-2.01A3 3 0 0 0 9 5H5a3 3 0 0 0 0 6h.08a6.06 6.06 0 0 0 0 2H5A5 5 0 0 1 5 3h4a5 5 0 0 1 .26 10zm1.48-6a2 2 0 0 1-.01 2.01A3 3 0 0 0 11 15h4a3 3 0 0 0 0-6h-.08a6.06 6.06 0 0 0 0-2H15a5 5 0 0 1 0 10h-4a5 5 0 0 1-.26-10z"/>
        </svg>
    )
}

function LogoutIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M5 11h8v2H5v3l-5-4l5-4v3Zm-1 7h2.708a8 8 0 1 0 0-12H4a9.985 9.985 0 0 1 8-4c5.523 0 10 4.477 10 10s-4.477 10-10 10a9.985 9.985 0 0 1-8-4Z"/>
        </svg>
    )
}

function ProfileIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} fillRule="evenodd" d="M12 4a8 8 0 0 0-6.96 11.947A4.99 4.99 0 0 1 9 14h6a4.99 4.99 0 0 1 3.96 1.947A8 8 0 0 0 12 4Zm7.943 14.076A9.959 9.959 0 0 0 22 12c0-5.523-4.477-10-10-10S2 6.477 2 12a9.958 9.958 0 0 0 2.057 6.076l-.005.018l.355.413A9.98 9.98 0 0 0 12 22a9.947 9.947 0 0 0 5.675-1.765a10.055 10.055 0 0 0 1.918-1.728l.355-.413l-.005-.018ZM12 6a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z" clipRule="evenodd"/>
        </svg>
    )
}

function SettingsIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M12.012 2.25c.734.008 1.465.093 2.182.253a.75.75 0 0 1 .582.649l.17 1.527a1.384 1.384 0 0 0 1.927 1.116l1.4-.615a.75.75 0 0 1 .85.174a9.793 9.793 0 0 1 2.205 3.792a.75.75 0 0 1-.272.825l-1.241.916a1.38 1.38 0 0 0 0 2.226l1.243.915a.75.75 0 0 1 .272.826a9.798 9.798 0 0 1-2.204 3.792a.75.75 0 0 1-.849.175l-1.406-.617a1.38 1.38 0 0 0-1.926 1.114l-.17 1.526a.75.75 0 0 1-.571.647a9.518 9.518 0 0 1-4.406 0a.75.75 0 0 1-.572-.647l-.169-1.524a1.382 1.382 0 0 0-1.925-1.11l-1.406.616a.75.75 0 0 1-.85-.175a9.798 9.798 0 0 1-2.203-3.796a.75.75 0 0 1 .272-.826l1.243-.916a1.38 1.38 0 0 0 0-2.226l-1.243-.914a.75.75 0 0 1-.272-.826a9.793 9.793 0 0 1 2.205-3.792a.75.75 0 0 1 .85-.174l1.4.615a1.387 1.387 0 0 0 1.93-1.118l.17-1.526a.75.75 0 0 1 .583-.65a10.72 10.72 0 0 1 2.201-.252Zm0 1.5a9.136 9.136 0 0 0-1.354.117l-.11.977A2.886 2.886 0 0 1 6.526 7.17l-.899-.394A8.293 8.293 0 0 0 4.28 9.092l.797.587a2.881 2.881 0 0 1 .001 4.643l-.799.588c.32.842.776 1.626 1.348 2.322l.905-.397a2.882 2.882 0 0 1 4.017 2.318l.109.984c.89.15 1.799.15 2.688 0l.11-.984a2.881 2.881 0 0 1 4.018-2.322l.904.396a8.299 8.299 0 0 0 1.348-2.318l-.798-.588a2.88 2.88 0 0 1-.001-4.643l.797-.587a8.293 8.293 0 0 0-1.348-2.317l-.897.393a2.884 2.884 0 0 1-4.023-2.324l-.109-.976a8.99 8.99 0 0 0-1.334-.117ZM12 8.25a3.75 3.75 0 1 1 0 7.5a3.75 3.75 0 0 1 0-7.5Zm0 1.5a2.25 2.25 0 1 0 0 4.5a2.25 2.25 0 0 0 0-4.5Z"/>
        </svg>
    )
}

function AltCommunityIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M7.5 3.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3ZM4.5 5a3 3 0 1 1 6 0a3 3 0 0 1-6 0Zm-.732 4C2.79 9 2 9.791 2 10.768v.36c0 .207 0 1.408.7 2.575c.548.91 1.477 1.727 2.975 2.093a2.777 2.777 0 0 1 1.062-1.335c-1.603-.171-2.361-.883-2.75-1.53c-.484-.806-.487-1.664-.487-1.806v-.357c0-.148.12-.268.268-.268H8.03A3.974 3.974 0 0 1 8.535 9H3.768Zm11.697 0c.261.452.437.959.504 1.5h4.263c.148 0 .268.12.268.268v.357c0 .142-.003 1-.487 1.805c-.389.648-1.147 1.36-2.75 1.531c.48.32.856.786 1.062 1.335c1.498-.366 2.427-1.183 2.974-2.093c.701-1.167.701-2.367.701-2.576v-.36C22 9.792 21.209 9 20.232 9h-4.767ZM15 5a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0Zm1.5-3a3 3 0 1 0 0 6a3 3 0 0 0 0-6ZM12 9.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3ZM9 11a3 3 0 1 1 6 0a3 3 0 0 1-6 0Zm-2.5 5.768C6.5 15.79 7.291 15 8.268 15h7.464c.977 0 1.768.791 1.768 1.768v.36c0 .207 0 1.408-.7 2.575C16.057 20.937 14.613 22 12 22s-4.058-1.063-4.8-2.297c-.7-1.167-.7-2.367-.7-2.576v-.36Zm1.768-.268a.268.268 0 0 0-.268.268v.357c0 .142.003 1 .487 1.805c.446.743 1.377 1.57 3.513 1.57s3.067-.827 3.513-1.57c.484-.805.487-1.663.487-1.805v-.357a.268.268 0 0 0-.268-.268H8.268Z"/>
        </svg>
    )
}

function HelpIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M11.95 18q.525 0 .888-.363t.362-.887q0-.525-.362-.888t-.888-.362q-.525 0-.887.363t-.363.887q0 .525.363.888t.887.362Zm-.9-3.85h1.85q0-.825.188-1.3t1.062-1.3q.65-.65 1.025-1.238T15.55 8.9q0-1.4-1.025-2.15T12.1 6q-1.425 0-2.313.75T8.55 8.55l1.65.65q.125-.45.563-.975T12.1 7.7q.8 0 1.2.438t.4.962q0 .5-.3.938t-.75.812q-1.1.975-1.35 1.475t-.25 1.825ZM12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20Zm0-8Z"/>
        </svg>
    )
}

function TAndCIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M6 22q-1.25 0-2.125-.875T3 19v-3h3V2h15v17q0 1.25-.875 2.125T18 22H6Zm12-2q.425 0 .713-.288T19 19V4H8v12h9v3q0 .425.288.713T18 20ZM9 9V7h9v2H9Zm0 3v-2h9v2H9Zm-3 8h9v-2H5v1q0 .425.288.713T6 20Zm0 0H5h10h-9Z"/>
        </svg>
    )
}

function OptionIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M12 14a2 2 0 1 0 0-4a2 2 0 0 0 0 4zm-6 0a2 2 0 1 0 0-4a2 2 0 0 0 0 4zm12 0a2 2 0 1 0 0-4a2 2 0 0 0 0 4z"/>
        </svg>
    )
}

function ArrowRight({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill="none" fillRule="evenodd">
                <path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/>
                <path fill={color} d="M15.707 11.293a1 1 0 0 1 0 1.414l-5.657 5.657a1 1 0 1 1-1.414-1.414l4.95-4.95l-4.95-4.95a1 1 0 0 1 1.414-1.414l5.657 5.657Z"/>
            </g>
        </svg>
    )
}

function HeartFilledIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill="none">
                <path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/>
                <path fill={color} d="M18.494 3.801c2.095 1.221 3.569 3.7 3.504 6.592C21.86 16.5 13.5 21 12 21s-9.861-4.5-9.998-10.607c-.065-2.892 1.409-5.37 3.504-6.592C7.466 2.66 9.928 2.653 12 4.338c2.072-1.685 4.534-1.679 6.494-.537Z"/>
            </g>
        </svg>
    )
}

function HeartLineIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill="none" fillRule="evenodd">
                <path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/>
                <path fill={color} d="M18.494 3.801c2.095 1.221 3.569 3.7 3.504 6.592c-.081 3.61-2.89 6.794-7.679 9.638c-.71.422-1.458.969-2.319.969c-.845 0-1.625-.557-2.32-.97c-4.787-2.843-7.597-6.028-7.678-9.637c-.065-2.892 1.409-5.37 3.504-6.592C7.466 2.66 9.928 2.653 12 4.338c2.072-1.685 4.534-1.679 6.494-.537ZM17.487 5.53c-1.394-.812-3.136-.783-4.644.743a1.188 1.188 0 0 1-1.686 0c-1.508-1.526-3.25-1.555-4.644-.743c-1.444.842-2.56 2.628-2.511 4.82c.056 2.511 2.04 5.194 6.7 7.962c.408.243.834.554 1.298.683c.464-.129.89-.44 1.298-.683c4.66-2.768 6.644-5.45 6.7-7.963c.05-2.19-1.067-3.977-2.511-4.819Z"/>
            </g>
        </svg>
    )
}

function CommentIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M6 14h12v-2H6v2Zm0-3h12V9H6v2Zm0-3h12V6H6v2Zm16 14l-4-4H4q-.825 0-1.413-.588T2 16V4q0-.825.588-1.413T4 2h16q.825 0 1.413.588T22 4v18ZM4 16V4v12Zm14.85 0L20 17.125V4H4v12h14.85Z"/>
        </svg>
    )
}

function ShareIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81c1.66 0 3-1.34 3-3s-1.34-3-3-3s-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65c0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
        </svg>
    )
}

function CameraIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} fillRule="evenodd" d="M7.598 4.487c.267-1.31 1.433-2.237 2.768-2.237h3.268c1.335 0 2.5.927 2.768 2.237a.656.656 0 0 0 .62.524h.033c1.403.062 2.481.234 3.381.825c.567.372 1.055.85 1.435 1.409c.473.694.681 1.492.781 2.456c.098.943.098 2.124.098 3.62v.085c0 1.496 0 2.678-.098 3.62c-.1.964-.308 1.762-.781 2.457a5.155 5.155 0 0 1-1.435 1.409c-.703.461-1.51.665-2.488.762c-.958.096-2.159.096-3.685.096H9.737c-1.526 0-2.727 0-3.685-.096c-.978-.097-1.785-.3-2.488-.762a5.155 5.155 0 0 1-1.435-1.41c-.473-.694-.681-1.492-.781-2.456c-.098-.942-.098-2.124-.098-3.62v-.085c0-1.496 0-2.677.098-3.62c.1-.964.308-1.762.781-2.456a5.155 5.155 0 0 1 1.435-1.41c.9-.59 1.978-.762 3.381-.823l.017-.001h.016a.656.656 0 0 0 .62-.524Zm2.768-.737c-.64 0-1.177.443-1.298 1.036c-.195.96-1.047 1.716-2.072 1.725c-1.348.06-2.07.225-2.61.579a3.665 3.665 0 0 0-1.017.999c-.276.405-.442.924-.53 1.767c-.088.856-.089 1.96-.089 3.508s0 2.651.09 3.507c.087.843.253 1.362.53 1.768c.268.394.613.734 1.017.998c.417.274.951.439 1.814.525c.874.087 2 .088 3.577.088h4.444c1.576 0 2.702 0 3.577-.088c.863-.086 1.397-.25 1.814-.524c.404-.265.75-.605 1.018-1c.276-.405.442-.924.53-1.767c.088-.856.089-1.96.089-3.507c0-1.548 0-2.652-.09-3.508c-.087-.843-.253-1.362-.53-1.767a3.655 3.655 0 0 0-1.017-1c-.538-.353-1.26-.518-2.61-.578c-1.024-.01-1.876-.764-2.071-1.725a1.314 1.314 0 0 0-1.298-1.036h-3.268Zm1.634 7a2.25 2.25 0 1 0 0 4.5a2.25 2.25 0 0 0 0-4.5ZM8.25 13a3.75 3.75 0 1 1 7.5 0a3.75 3.75 0 0 1-7.5 0Zm9-3a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Z" clipRule="evenodd"/>
        </svg>
    )
}

function ReplyIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M10 9V5l-7 7l7 7v-4.1c5 0 8.5 1.6 11 5.1c-1-5-4-10-11-11z"/>
        </svg>
    )
}

function SendIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.912 12H4L2.023 4.135A.662.662 0 0 1 2 3.995c-.022-.721.772-1.221 1.46-.891L22 12L3.46 20.896c-.68.327-1.464-.159-1.46-.867a.66.66 0 0 1 .033-.186L3.5 15"/>
        </svg>
    )
}

function PrivacyIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="m12 3.19l7 3.11V11c0 4.52-2.98 8.69-7 9.93c-4.02-1.24-7-5.41-7-9.93V6.3l7-3.11M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/>
        </svg>
    )
}

function AddIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill={color} fillRule="evenodd" clipRule="evenodd">
                <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12Zm10-8a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z"/>
                <path d="M13 7a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7Z"/>
            </g>
        </svg>
    )
}

function BirthdayIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M12.68 5.88c.7-.24 1.22-.9 1.3-1.64c.05-.47-.05-.91-.28-1.27L12.42.75a.506.506 0 0 0-.87 0l-1.28 2.22c-.17.3-.27.65-.27 1.03c0 1.32 1.3 2.35 2.68 1.88zm3.85 10.04l-1-1l-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07l-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-3.61c-.75.51-1.71.75-2.74.52c-.66-.14-1.25-.51-1.73-.99zM18 9h-5V8c0-.55-.45-1-1-1s-1 .45-1 1v1H6c-1.66 0-3 1.34-3 3v1.46c0 .85.5 1.67 1.31 1.94c.73.24 1.52.06 2.03-.46l2.14-2.13l2.13 2.13c.76.76 2.01.76 2.77 0l2.14-2.13l2.13 2.13c.43.43 1.03.63 1.65.55c.99-.13 1.69-1.06 1.69-2.06v-1.42A2.983 2.983 0 0 0 18 9z"/>
        </svg>
    )
}

function FollowIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} fillRule="evenodd" d="M4 4.5h12V11h1.5V3h-15v12a2 2 0 0 0 2 2h7v-1.5h-7A.5.5 0 0 1 4 15zm10.5 2h-9V8h9zm-5 3h-4V11h4zM13 11h-1v1h1zm-1-1.5h-1.5v4h4v-4H13zM9.5 12h-4v1.5h4zm6.5 1.25h1.5v2.25h2.25V17H17.5v2.25H16V17h-2.25v-1.5H16z" clipRule="evenodd"/>
        </svg>
    )
}

function MessagesIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill="none">
                <path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/>
                <path fill={color} d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10H4a2 2 0 0 1-2-2v-8C2 6.477 6.477 2 12 2Zm0 12H9a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2Zm3-4H9a1 1 0 0 0-.117 1.993L9 12h6a1 1 0 0 0 .117-1.993L15 10Z"/>
            </g>
        </svg>
    )
}

function PeopleIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill="none" stroke={color} strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.719 19.752l-.64-5.124A3 3 0 0 0 13.101 12h-2.204a3 3 0 0 0-2.976 2.628l-.641 5.124A2 2 0 0 0 9.266 22h5.468a2 2 0 0 0 1.985-2.248Z"/>
                <circle cx="12" cy="5" r="3"/>
                <circle cx="4" cy="9" r="2"/>
                <circle cx="20" cy="9" r="2"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h-.306a2 2 0 0 0-1.973 1.671l-.333 2A2 2 0 0 0 3.361 20H7m13-6h.306a2 2 0 0 1 1.973 1.671l.333 2A2 2 0 0 1 20.639 20H17"/>
            </g>
        </svg>
    )
}

function SearchIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314Z"/>
        </svg>
    )
}

function FacebookIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"/>
        </svg>
    )
}

function XIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584l-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
        </svg>
    )
}

function InstagramIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M12 9.52A2.48 2.48 0 1 0 14.48 12A2.48 2.48 0 0 0 12 9.52Zm9.93-2.45a6.53 6.53 0 0 0-.42-2.26a4 4 0 0 0-2.32-2.32a6.53 6.53 0 0 0-2.26-.42C15.64 2 15.26 2 12 2s-3.64 0-4.93.07a6.53 6.53 0 0 0-2.26.42a4 4 0 0 0-2.32 2.32a6.53 6.53 0 0 0-.42 2.26C2 8.36 2 8.74 2 12s0 3.64.07 4.93a6.86 6.86 0 0 0 .42 2.27a3.94 3.94 0 0 0 .91 1.4a3.89 3.89 0 0 0 1.41.91a6.53 6.53 0 0 0 2.26.42C8.36 22 8.74 22 12 22s3.64 0 4.93-.07a6.53 6.53 0 0 0 2.26-.42a3.89 3.89 0 0 0 1.41-.91a3.94 3.94 0 0 0 .91-1.4a6.6 6.6 0 0 0 .42-2.27C22 15.64 22 15.26 22 12s0-3.64-.07-4.93Zm-2.54 8a5.73 5.73 0 0 1-.39 1.8A3.86 3.86 0 0 1 16.87 19a5.73 5.73 0 0 1-1.81.35H8.94A5.73 5.73 0 0 1 7.13 19a3.51 3.51 0 0 1-1.31-.86A3.51 3.51 0 0 1 5 16.87a5.49 5.49 0 0 1-.34-1.81V8.94A5.49 5.49 0 0 1 5 7.13a3.51 3.51 0 0 1 .86-1.31A3.59 3.59 0 0 1 7.13 5a5.73 5.73 0 0 1 1.81-.35h6.12a5.73 5.73 0 0 1 1.81.35a3.51 3.51 0 0 1 1.31.86A3.51 3.51 0 0 1 19 7.13a5.73 5.73 0 0 1 .35 1.81V12c0 2.06.07 2.27.04 3.06Zm-1.6-7.44a2.38 2.38 0 0 0-1.41-1.41A4 4 0 0 0 15 6H9a4 4 0 0 0-1.38.26a2.38 2.38 0 0 0-1.41 1.36A4.27 4.27 0 0 0 6 9v6a4.27 4.27 0 0 0 .26 1.38a2.38 2.38 0 0 0 1.41 1.41a4.27 4.27 0 0 0 1.33.26h6a4 4 0 0 0 1.38-.26a2.38 2.38 0 0 0 1.41-1.41a4 4 0 0 0 .26-1.38V9a3.78 3.78 0 0 0-.26-1.38ZM12 15.82A3.81 3.81 0 0 1 8.19 12A3.82 3.82 0 1 1 12 15.82Zm4-6.89a.9.9 0 0 1 0-1.79a.9.9 0 0 1 0 1.79Z"/>
        </svg>
    )
}

function ExitIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 4h3a2 2 0 0 1 2 2v1m-5 13h3a2 2 0 0 0 2-2v-1M4.425 19.428l6 1.8A2 2 0 0 0 13 19.312V4.688a2 2 0 0 0-2.575-1.916l-6 1.8A2 2 0 0 0 3 6.488v11.024a2 2 0 0 0 1.425 1.916zM9.001 12H9m7 0h5m0 0l-2-2m2 2l-2 2"/>
        </svg>
    )
}

function CalendarIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M19 19H5V8h14m-3-7v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1V1m-1 11h-5v5h5v-5Z"/>
        </svg>
    )
}

function EnterIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 4h3a2 2 0 0 1 2 2v1m-5 13h3a2 2 0 0 0 2-2v-1M4.425 19.428l6 1.8A2 2 0 0 0 13 19.312V4.688a2 2 0 0 0-2.575-1.916l-6 1.8A2 2 0 0 0 3 6.488v11.024a2 2 0 0 0 1.425 1.916zM9.001 12H9m12 0h-5m0 0l2-2m-2 2l2 2"/>
        </svg>
    )
}

function BlockIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="M12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-2q3.35 0 5.675-2.325T20 12q0-1.35-.438-2.6T18.3 7.1L7.1 18.3q1.05.825 2.3 1.263T12 20Zm-6.3-3.1L16.9 5.7q-1.05-.825-2.3-1.262T12 4Q8.65 4 6.325 6.325T4 12q0 1.35.437 2.6T5.7 16.9Z"/>
        </svg>
    )
}

function KeyIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/>
                <circle cx="16.5" cy="7.5" r=".5"/>
            </g>
        </svg>
    )
}

function DarkIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <path fill={color} d="m20.995 11.711l1-.031a1 1 0 0 0-1.284-.927l.285.958Zm-8.707-8.706l.96.284a1 1 0 0 0-.928-1.284l-.031 1Zm8.423 7.748A6.002 6.002 0 0 1 19 11v2a8 8 0 0 0 2.28-.33l-.57-1.917ZM19 11a6 6 0 0 1-6-6h-2a8 8 0 0 0 8 8v-2Zm-6-6c0-.596.087-1.17.247-1.71l-1.917-.57A8 8 0 0 0 11 5h2Zm-1-1c.086 0 .172.001.257.004l.063-1.999A10.19 10.19 0 0 0 12 2v2Zm-8 8a8 8 0 0 1 8-8V2C6.477 2 2 6.477 2 12h2Zm8 8a8 8 0 0 1-8-8H2c0 5.523 4.477 10 10 10v-2Zm8-8a8 8 0 0 1-8 8v2c5.523 0 10-4.477 10-10h-2Zm-.004-.257c.003.085.004.171.004.257h2c0-.107-.002-.214-.005-.32l-1.999.063Z"/>
        </svg>
    )
}

function BookmarkIconFilled({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill="none">
                <path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/>
                <path fill={color} d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v16.028c0 1.22-1.38 1.93-2.372 1.221L12 18.229l-5.628 4.02c-.993.71-2.372 0-2.372-1.22V5Z"/>
            </g>
        </svg>
    )
}

function BookmarkIconLine({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill="none" fillRule="evenodd">
                <path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/>
                <path fill={color} d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v16.028c0 1.22-1.38 1.93-2.372 1.221L12 18.229l-5.628 4.02c-.993.71-2.372 0-2.372-1.22V5Zm3-1a1 1 0 0 0-1 1v15.057l5.128-3.663a1.5 1.5 0 0 1 1.744 0L18 20.057V5a1 1 0 0 0-1-1H7Z"/>
            </g>
        </svg>
    )
}

function PlayIcon({color, width, height}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
            <g fill="none" fillRule="evenodd">
                <path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/>
                <path fill={color} d="M5.669 4.76a1.469 1.469 0 0 1 2.04-1.177c1.062.454 3.442 1.533 6.462 3.276c3.021 1.744 5.146 3.267 6.069 3.958c.788.591.79 1.763.001 2.356c-.914.687-3.013 2.19-6.07 3.956c-3.06 1.766-5.412 2.832-6.464 3.28c-.906.387-1.92-.2-2.038-1.177c-.138-1.142-.396-3.735-.396-7.237c0-3.5.257-6.092.396-7.235Z"/>
            </g>
        </svg>
    )
}

function j({color, width, height}) {
    return (
       <div></div>
    )
}

function k({color, width, height}) {
    return (
       <div></div>
    )
}

function l({color, width, height}) {
    return (
       <div></div>
    )
}

function m({color, width, height}) {
    return (
       <div></div>
    )
}

function n({color, width, height}) {
    return (
       <div></div>
    )
}

function o({color, width, height}) {
    return (
       <div></div>
    )
}

function p({color, width, height}) {
    return (
       <div></div>
    )
}

function q({color, width, height}) {
    return (
       <div></div>
    )
}

function r({color, width, height}) {
    return (
       <div></div>
    )
}

function s({color, width, height}) {
    return (
       <div></div>
    )
}

function t({color, width, height}) {
    return (
       <div></div>
    )
}

function u({color, width, height}) {
    return (
       <div></div>
    )
}

function v({color, width, height}) {
    return (
       <div></div>
    )
}

function w({color, width, height}) {
    return (
       <div></div>
    )
}

function x({color, width, height}) {
    return (
       <div></div>
    )
}

function y({color, width, height}) {
    return (
       <div></div>
    )
}

function z({color, width, height}) {
    return (
       <div></div>
    )
}




const SVGServer = {
    CloseIcon,
    CheckIcon,
    CancelIcon,
    WarningIcon,
    ErrorIcon,
    MenuIcon,
    FeedIcon,
    CommunityIcon,
    AltCommunityIcon,
    NotificationIcon,
    CreatePostIcon,
    ChatIcon,
    DeleteIcon,
    ReplyIcon,
    ImageIcon,
    VideoIcon,
    LinkIcon,
    OptionIcon,
    ProfileIcon,
    SettingsIcon,
    LogoutIcon,
    HelpIcon,
    TAndCIcon,
    ArrowRight,
    HeartFilledIcon,
    HeartLineIcon,
    CommentIcon,
    ShareIcon,
    CameraIcon,
    SendIcon,
    PrivacyIcon,
    AddIcon,
    BirthdayIcon,
    FollowIcon,
    MessagesIcon,
    PeopleIcon,
    SearchIcon,
    FacebookIcon,
    InstagramIcon,
    XIcon,
    ExitIcon,
    EnterIcon,
    CalendarIcon,
    BlockIcon,
    KeyIcon,
    DarkIcon,
    BookmarkIconFilled,
    BookmarkIconLine,
    PlayIcon
}

export default SVGServer;