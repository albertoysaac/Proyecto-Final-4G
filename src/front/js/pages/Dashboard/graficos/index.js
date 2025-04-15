import React from 'react';

const Areachart = React.lazy(() => import('./areaChart'));
const Barchart = React.lazy(() => import('./barChart'));
const Piechart = React.lazy(() => import('./pieChart'));
const AreaVSChart = React.lazy(() => import('./areaVSChart'));

export { AreaVSChart, Areachart, Barchart, Piechart };