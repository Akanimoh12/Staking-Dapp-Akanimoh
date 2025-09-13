import { formatEther } from 'viem';
import { useProtocolAnalytics, useRewardAnalytics } from '../hooks/subgraph';

export function AnalyticsDashboard() {
  const { 
    currentStats,
    historicalStats,
    trends,
    userCount,
    isLoading: protocolLoading 
  } = useProtocolAnalytics();

  const {
    formattedTotalRewards,
    rewardHistory,
    efficiencyMetrics,
    isLoading: rewardsLoading
  } = useRewardAnalytics();

  if (protocolLoading || rewardsLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Analytics Dashboard</h3>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const formatTrend = (trend: number) => {
    const isPositive = trend > 0;
    return (
      <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Protocol Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Protocol Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {currentStats?.totalStaked ? formatEther(BigInt(currentStats.totalStaked)) : '0'}
            </div>
            <div className="text-sm text-gray-500 mb-2">Total Staked (STK)</div>
            {trends.stakingTrend !== undefined && formatTrend(trends.stakingTrend)}
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {userCount}
            </div>
            <div className="text-sm text-gray-500 mb-2">Total Users</div>
            {trends.userTrend !== undefined && formatTrend(trends.userTrend)}
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {currentStats?.currentRewardRate ? `${Number(currentStats.currentRewardRate) / 100}%` : '0%'}
            </div>
            <div className="text-sm text-gray-500 mb-2">Current APR</div>
          </div>
        </div>
      </div>

      {/* Personal Analytics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Your Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-lg font-bold text-green-700 mb-1">
              {formattedTotalRewards}
            </div>
            <div className="text-sm text-green-600">Total Rewards Earned</div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-lg font-bold text-blue-700 mb-1">
              {rewardHistory.length}
            </div>
            <div className="text-sm text-blue-600">Claims Made</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-lg font-bold text-purple-700 mb-1">
              {efficiencyMetrics?.averageRewardPerStake ? 
                `${(Number(efficiencyMetrics.averageRewardPerStake) / 100).toFixed(2)}%` : 
                '0%'
              }
            </div>
            <div className="text-sm text-purple-600">Avg. Reward Rate</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-lg font-bold text-orange-700 mb-1">
              {efficiencyMetrics?.totalStakingDuration ? 
                Math.floor(efficiencyMetrics.totalStakingDuration / 86400) : 
                0
              }
            </div>
            <div className="text-sm text-orange-600">Days Staked</div>
          </div>
        </div>
      </div>

      {/* Recent Activity Chart */}
      {historicalStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Protocol Activity (Last 30 Days)</h3>
          
          <div className="space-y-4">
            {historicalStats.slice(0, 7).map((stat: any) => (
              <div key={stat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">{stat.date}</div>
                    <div className="text-sm text-gray-500">
                      {stat.newStakes} new stakes • {stat.withdrawals} withdrawals
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatEther(BigInt(stat.totalStaked))} STK
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatEther(BigInt(stat.volume))} volume
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}