import React from "react";
import PropTypes from "prop-types";

export const StatsCard = ({
title,value,icon,isLoading,subtitle,prefix = "",trend, extra,
trendType = "success",variant = "default", // 'default' | 'minimal'
}) => {
	if (isLoading) {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
		<div className="animate-pulse">
			<div className="h-4 bg-gray-200 rounded w-3/4"></div>
			<div className="space-y-3 mt-4">
			<div className="h-8 bg-gray-200 rounded"></div>
			</div>
		</div>
		</div>
	);
	}

	const baseClasses =
	variant === "default"
		? "bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
		: "p-4 bg-gray-50 dark:bg-gray-700 rounded-lg";

	const formatValue = (val) => {
	if (typeof val === "number") {
		return val.toFixed(3);
	}
	return val;
	};

	return (
	<div className={baseClasses}>
		<div className="flex justify-between items-start">
		<div>
			<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
			{title}
			</p>
			<p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
			{prefix}
			{formatValue(value)}
			</p>
			{subtitle && (
			<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
				{subtitle}
			</p>
			)}
			{trend !== undefined && (
			<div
				className={`mt-2 flex items-center text-sm ${
				trendType === "success"
					? "text-green-600 dark:text-green-400"
					: "text-red-600 dark:text-red-400"
				}`}
			>
				<i
				className={`bi bi-arrow-${trend >= 0 ? "up" : "down"} mr-1`}
				></i>
				{Math.abs(trend)}%
			</div>
			)}
		</div>
		{
			extra && (
				<div>
					<p className="text-sm font-medium text-gray-600 dark:text-gray-400">
						{title}
					</p>
				</div>
			) || null
		}
		<div
			className={`rounded-full p-3 ${
			isLoading
				? "bg-gray-200 dark:bg-gray-700"
				: variant === "default"
				? "bg-lime-100 dark:bg-lime-900"
				: "bg-transparent"
			}`}
		>
			<i
			className={`bi ${icon} text-xl ${
				isLoading
				? "text-gray-400"
				: variant === "default"
				? "text-lime-600 dark:text-lime-400"
				: "text-gray-400 dark:text-gray-500"
			}`}
			></i>
		</div>
		</div>
	</div>
	);
};

StatsCard.propTypes = {
	title: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	icon: PropTypes.string.isRequired,
	isLoading: PropTypes.bool,
	subtitle: PropTypes.string,
	prefix: PropTypes.string,
	trend: PropTypes.number,
	trendType: PropTypes.oneOf(["success", "danger"]),
	variant: PropTypes.oneOf(["default", "minimal"]),
};

