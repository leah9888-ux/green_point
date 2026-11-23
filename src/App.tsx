              onPointsAwarded={async (reward, co2Grams, title) => {
                const currentUser = auth.currentUser;
                if (!currentUser) {
                  addToast("error", "포인트 내역을 확인하려면 구글 로그인이 필요합니다.");
                  return;
                }

                try {
                  // 서버에서 이미 포인트를 지급했으므로 클라이언트에서 다시 더하거나 저장하지 않습니다.
                  const [savedProfile, savedTransactions] = await Promise.all([
                    fetchUserProfile(currentUser.uid),
                    fetchUserTransactions(currentUser.uid)
                  ]);

                  if (!savedProfile) {
                    throw new Error("Firebase에서 사용자 정보를 불러오지 못했습니다.");
                  }

                  setUser((prev) => ({
                    ...prev,
                    name: savedProfile.name || prev.name,
                    email: savedProfile.email || prev.email,
                    points: savedProfile.points ?? prev.points,
                    completedMissions: savedProfile.completedMissions ?? prev.completedMissions,
                    co2SavedTotalG: savedProfile.co2SavedTotalG ?? prev.co2SavedTotalG,
                    level: savedProfile.level ?? prev.level
                  }));
                  setHistory(savedTransactions);
                  addToast("success", `AI 인증 완료! +${reward.toLocaleString()}P가 Firebase에 저장되었습니다.`);
                } catch (error) {
                  console.error("포인트 적립 후 새로고침 오류:", error);
                  addToast("info", "포인트 지급 요청은 완료되었지만 화면 갱신에 실패했습니다. 새로고침 후 내역을 확인해 주세요.");
                }
              }}
            />
          )}

          {currentScreen === "admin" && (
            <AdminScreen
              onNavigate={handleNavigate}
              adminEmail={user.email}
              onGrantUserPoints={(userId, points, title) => {
                const updatedUser = { ...user, points: user.points + points };
                setUser(updatedUser);
                const tx: Transaction = {
                  id: "tx-admin-" + Date.now(),
                  title,
                  points,
                  date: new Date().toLocaleDateString("ko-KR"),
                  category: "bonus"
                };
                setHistory((prev) => [tx, ...prev]);
                if (auth.currentUser) {
                  syncUserProfile(updatedUser).catch(console.error);
                  saveTransaction(tx).catch(console.error);
                }
                addToast("success", `[관리자 승인] ${points}P가 지급되었습니다.`);
              }}
            />
          )}

          {currentScreen === "testlab" && (
            <TestLabScreen onNavigate={handleNavigate} />
          )}

          {currentScreen === "points" && (
            <PointsScreen
              points={user.points}
              history={history}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === "benefits" && (
            <BenefitsScreen
              coupons={AVAILABLE_COUPONS}
              userPoints={user.points}
              onNavigate={handleNavigate}
              onSelectCoupon={handleSelectCoupon}
            />
          )}

          {currentScreen === "coupon" && (
            <CouponScreen
              userPoints={user.points}
              availableCoupons={AVAILABLE_COUPONS}
              myCoupons={myCoupons}
              onExchange={handleExchangeCoupon}
              onUseCoupon={handleUseCoupon}
              onNavigate={handleNavigate}
              selectedCoupon={selectedCouponForExchange}
            />
          )}

          {currentScreen === "sports" && (
            <SportsScreen
              onNavigate={handleNavigate}
              onStartMission={handleStartMission}
            />
          )}

          {currentScreen === "profile" && (
            <ProfileScreen
              user={user}
              couponCount={myCoupons.length}
              onNavigate={handleNavigate}
              onUpdateName={handleUpdateName}
              onResetData={handleResetData}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Persistent Bottom Navigation */}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          couponCount={myCoupons.filter((c) => !c.used).length}
        />
      </div>
    </div>
  );
}
